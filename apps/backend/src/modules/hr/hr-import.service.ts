import { Injectable, BadRequestException } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { CreateEmployeeDto } from './dto/create-employee.dto'

const COLUMN_MAP: Record<string, string> = {
  'שם פרטי': 'firstName',
  'שם משפחה': 'lastName',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'אימייל': 'email',
  'Email': 'email',
  'טלפון': 'phone',
  'Phone': 'phone',
  'תאריך תחילת עבודה': 'startDate',
  'Start Date': 'startDate',
  'סוג העסקה': 'contractType',
  'Contract Type': 'contractType',
  'מחלקה': 'departmentId',
  'Department': 'departmentId',
  'תפקיד': 'positionId',
  'Position': 'positionId',
  'תעודת זהות': 'nationalId',
  'National ID': 'nationalId',
}

const CONTRACT_TYPE_MAP: Record<string, string> = {
  'קבוע': 'permanent',
  'זמני': 'temporary',
  'קבלן': 'contractor',
  'permanent': 'permanent',
  'temporary': 'temporary',
  'contractor': 'contractor',
}

@Injectable()
export class HrImportService {
  async parseExcel(buffer: Buffer): Promise<{ employees: Partial<CreateEmployeeDto>[]; errors: string[] }> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[0]
    if (!sheet) throw new BadRequestException('No worksheet found in file')

    const headers: string[] = []
    sheet.getRow(1).eachCell(cell => headers.push(String(cell.value || '').trim()))

    const employees: Partial<CreateEmployeeDto>[] = []
    const errors: string[] = []

    sheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return

      const emp: any = {}
      row.eachCell((cell, colIndex) => {
        const header = headers[colIndex - 1]
        const field = COLUMN_MAP[header]
        if (field) {
          let value = cell.value
          if (field === 'startDate' && value instanceof Date) {
            value = value.toISOString().split('T')[0]
          }
          if (field === 'contractType' && typeof value === 'string') {
            value = CONTRACT_TYPE_MAP[value] || 'permanent'
          }
          emp[field] = value
        }
      })

      if (!emp.firstName || !emp.email) {
        errors.push(`שורה ${rowIndex}: חסרים שדות חובה (שם פרטי / אימייל)`)
        return
      }

      employees.push(emp)
    })

    return { employees, errors }
  }

  getTemplateBuffer(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('עובדים')

    const headers = [
      'שם פרטי', 'שם משפחה', 'אימייל', 'טלפון',
      'תאריך תחילת עבודה', 'סוג העסקה', 'מחלקה', 'תפקיד', 'תעודת זהות'
    ]

    const headerRow = sheet.addRow(headers)
    headerRow.font = { bold: true }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Example row
    sheet.addRow(['ישראל', 'ישראלי', 'israel@example.com', '050-0000000', '2024-01-01', 'קבוע', '', '', ''])

    sheet.columns.forEach(col => { col.width = 20 })

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }
}
