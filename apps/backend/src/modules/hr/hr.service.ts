import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindManyOptions } from 'typeorm'
import { EmployeeEntity } from '../../database/entities/employee.entity'
import { DepartmentEntity } from '../../database/entities/department.entity'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(EmployeeEntity) private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(DepartmentEntity) private readonly deptRepo: Repository<DepartmentEntity>,
  ) {}

  async findAllEmployees(tenantId: string, query: {
    search?: string
    departmentId?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const { search, departmentId, status, page = 1, limit = 20 } = query
    const where: any = { tenantId }
    if (departmentId) where.departmentId = departmentId
    if (status) where.status = status

    const options: FindManyOptions<EmployeeEntity> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    }

    if (search) {
      options.where = [
        { tenantId, firstName: Like(`%${search}%`) },
        { tenantId, lastName: Like(`%${search}%`) },
        { tenantId, employeeNumber: Like(`%${search}%`) },
        { tenantId, email: Like(`%${search}%`) },
      ]
    }

    const [data, total] = await this.employeeRepo.findAndCount(options)
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOneEmployee(tenantId: string, id: string) {
    const employee = await this.employeeRepo.findOne({ where: { id, tenantId } })
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto) {
    const count = await this.employeeRepo.count({ where: { tenantId } })
    const employeeNumber = `EMP-${String(count + 1).padStart(5, '0')}`
    const employee = this.employeeRepo.create({ ...dto, tenantId, employeeNumber })
    return this.employeeRepo.save(employee)
  }

  async updateEmployee(tenantId: string, id: string, dto: UpdateEmployeeDto) {
    await this.findOneEmployee(tenantId, id)
    await this.employeeRepo.update({ id, tenantId }, dto)
    return this.findOneEmployee(tenantId, id)
  }

  async deleteEmployee(tenantId: string, id: string) {
    await this.findOneEmployee(tenantId, id)
    await this.employeeRepo.update({ id, tenantId }, { status: 'inactive' })
    return { success: true }
  }

  async findAllDepartments(tenantId: string) {
    return this.deptRepo.find({ where: { tenantId, isActive: true }, order: { name: 'ASC' } })
  }

  async createDepartment(tenantId: string, dto: { name: string; code: string; managerId?: string }) {
    const dept = this.deptRepo.create({ ...dto, tenantId })
    return this.deptRepo.save(dept)
  }

  async getStats(tenantId: string) {
    const [total, active, onLeave, inactive] = await Promise.all([
      this.employeeRepo.count({ where: { tenantId } }),
      this.employeeRepo.count({ where: { tenantId, status: 'active' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'on_leave' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'inactive' } }),
    ])
    return { total, active, onLeave, inactive }
  }
}
