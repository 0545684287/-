import { Injectable } from '@nestjs/common'
import * as ExcelJS from 'exceljs'
import { EmployeeEntity } from '../../database/entities/employee.entity'

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל', inactive: 'לא פעיל', on_leave: 'בחופשה',
}
const CONTRACT_LABELS: Record<string, string> = {
  permanent: 'קבוע', temporary: 'זמני', contractor: 'קבלן',
}

@Injectable()
export class HrExportService {
  async exportEmployeesToExcel(employees: EmployeeEntity[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'SafetyWork'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('עובדים', { views: [{ rightToLeft: true }] })

    const columns = [
      { header: 'מספר עובד', key: 'employeeNumber', width: 15 },
      { header: 'שם פרטי', key: 'firstName', width: 15 },
      { header: 'שם משפחה', key: 'lastName', width: 15 },
      { header: 'אימייל', key: 'email', width: 25 },
      { header: 'טלפון', key: 'phone', width: 15 },
      { header: 'סטטוס', key: 'status', width: 12 },
      { header: 'סוג העסקה', key: 'contractType', width: 12 },
      { header: 'תאריך תחילת עבודה', key: 'startDate', width: 20 },
      { header: 'תאריך יצירה', key: 'createdAt', width: 20 },
    ]

    sheet.columns = columns

    const headerRow = sheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    headerRow.height = 22

    employees.forEach((emp, i) => {
      const row = sheet.addRow({
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone || '',
        status: STATUS_LABELS[emp.status] || emp.status,
        contractType: CONTRACT_LABELS[emp.contractType] || emp.contractType,
        startDate: emp.startDate ? new Date(emp.startDate).toLocaleDateString('he-IL') : '',
        createdAt: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('he-IL') : '',
      })
      if (i % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
    })

    return workbook.xlsx.writeBuffer() as Promise<Buffer>
  }
}
