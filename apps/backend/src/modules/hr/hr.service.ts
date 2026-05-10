import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindOptionsWhere, DataSource } from 'typeorm'
import { EmployeeEntity } from '../../database/entities/employee.entity'
import { DepartmentEntity } from '../../database/entities/department.entity'
import { PositionEntity } from '../../database/entities/position.entity'
import { EmployeeHistoryEntity } from '../../database/entities/employee-history.entity'
import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { CreatePositionDto } from './dto/create-position.dto'
import { EmployeeQueryDto } from './dto/employee-query.dto'

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(EmployeeEntity) private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(DepartmentEntity) private readonly deptRepo: Repository<DepartmentEntity>,
    @InjectRepository(PositionEntity) private readonly positionRepo: Repository<PositionEntity>,
    @InjectRepository(EmployeeHistoryEntity) private readonly historyRepo: Repository<EmployeeHistoryEntity>,
  ) {}

  async findAllEmployees(tenantId: string, query: EmployeeQueryDto) {
    const { search, departmentId, status, contractType, page = 1, limit = 20, sortBy = 'createdAt', sortDir = 'DESC' } = query

    const qb = this.employeeRepo.createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })

    if (search) {
      qb.andWhere(
        '(e.firstName ILIKE :s OR e.lastName ILIKE :s OR e.employeeNumber ILIKE :s OR e.email ILIKE :s)',
        { s: `%${search}%` },
      )
    }
    if (departmentId) qb.andWhere('e.departmentId = :departmentId', { departmentId })
    if (status) qb.andWhere('e.status = :status', { status })
    if (contractType) qb.andWhere('e.contractType = :contractType', { contractType })

    qb.orderBy(`e.${sortBy}`, sortDir as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    const [data, total] = await qb.getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOneEmployee(tenantId: string, id: string) {
    const employee = await this.employeeRepo.findOne({ where: { id, tenantId } })
    if (!employee) throw new NotFoundException('Employee not found')
    return employee
  }

  async createEmployee(tenantId: string, dto: CreateEmployeeDto, changedBy?: string) {
    const existing = await this.employeeRepo.findOne({ where: { tenantId, email: dto.email } })
    if (existing) throw new ConflictException('Employee with this email already exists')

    const count = await this.employeeRepo.count({ where: { tenantId } })
    const employeeNumber = `EMP-${String(count + 1).padStart(5, '0')}`

    const employee = this.employeeRepo.create({ ...dto, tenantId, employeeNumber, status: 'active' })
    const saved = await this.employeeRepo.save(employee)

    await this.historyRepo.save({
      tenantId,
      employeeId: saved.id,
      changeType: 'created',
      before: {},
      after: saved,
      changedBy,
    })

    return saved
  }

  async updateEmployee(tenantId: string, id: string, dto: UpdateEmployeeDto, changedBy?: string) {
    const before = await this.findOneEmployee(tenantId, id)

    const trackChanges: string[] = []
    if (dto.departmentId && dto.departmentId !== before.departmentId) trackChanges.push('department_change')
    if (dto.positionId && dto.positionId !== before.positionId) trackChanges.push('position_change')
    if (dto.status && dto.status !== before.status) trackChanges.push('status_change')

    await this.employeeRepo.update({ id, tenantId }, dto as any)
    const after = await this.findOneEmployee(tenantId, id)

    for (const changeType of trackChanges) {
      await this.historyRepo.save({ tenantId, employeeId: id, changeType, before, after, changedBy })
    }

    return after
  }

  async deactivateEmployee(tenantId: string, id: string, changedBy?: string) {
    const before = await this.findOneEmployee(tenantId, id)
    await this.employeeRepo.update({ id, tenantId }, { status: 'inactive', endDate: new Date() as any })
    const after = await this.findOneEmployee(tenantId, id)
    await this.historyRepo.save({ tenantId, employeeId: id, changeType: 'status_change', before, after, changedBy })
    return { success: true }
  }

  async getEmployeeHistory(tenantId: string, employeeId: string) {
    await this.findOneEmployee(tenantId, employeeId)
    return this.historyRepo.find({
      where: { tenantId, employeeId },
      order: { createdAt: 'DESC' },
    })
  }

  async updateAvatar(tenantId: string, id: string, avatarUrl: string) {
    await this.findOneEmployee(tenantId, id)
    await this.employeeRepo.update({ id, tenantId }, { avatar: avatarUrl })
    return { avatar: avatarUrl }
  }

  // Departments
  async findAllDepartments(tenantId: string) {
    const depts = await this.deptRepo.find({ where: { tenantId, isActive: true }, order: { name: 'ASC' } })
    const counts = await Promise.all(
      depts.map(d => this.employeeRepo.count({ where: { tenantId, departmentId: d.id, status: 'active' } }))
    )
    return depts.map((d, i) => ({ ...d, employeeCount: counts[i] }))
  }

  async createDepartment(tenantId: string, dto: CreateDepartmentDto) {
    const dept = this.deptRepo.create({ ...dto, tenantId })
    return this.deptRepo.save(dept)
  }

  async updateDepartment(tenantId: string, id: string, dto: Partial<CreateDepartmentDto>) {
    await this.deptRepo.update({ id, tenantId }, dto)
    return this.deptRepo.findOne({ where: { id, tenantId } })
  }

  // Positions
  async findAllPositions(tenantId: string, departmentId?: string) {
    const where: any = { tenantId, isActive: true }
    if (departmentId) where.departmentId = departmentId
    return this.positionRepo.find({ where, order: { title: 'ASC' } })
  }

  async createPosition(tenantId: string, dto: CreatePositionDto) {
    const position = this.positionRepo.create({ ...dto, tenantId })
    return this.positionRepo.save(position)
  }

  // Stats
  async getStats(tenantId: string) {
    const [total, active, onLeave, inactive, permanent, temporary, contractors] = await Promise.all([
      this.employeeRepo.count({ where: { tenantId } }),
      this.employeeRepo.count({ where: { tenantId, status: 'active' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'on_leave' } }),
      this.employeeRepo.count({ where: { tenantId, status: 'inactive' } }),
      this.employeeRepo.count({ where: { tenantId, contractType: 'permanent', status: 'active' } }),
      this.employeeRepo.count({ where: { tenantId, contractType: 'temporary', status: 'active' } }),
      this.employeeRepo.count({ where: { tenantId, contractType: 'contractor', status: 'active' } }),
    ])

    const deptBreakdown = await this.employeeRepo
      .createQueryBuilder('e')
      .select('e.departmentId', 'departmentId')
      .addSelect('COUNT(*)', 'count')
      .where('e.tenantId = :tenantId AND e.status = :status', { tenantId, status: 'active' })
      .groupBy('e.departmentId')
      .getRawMany()

    return { total, active, onLeave, inactive, byContract: { permanent, temporary, contractors }, deptBreakdown }
  }

  async bulkCreate(tenantId: string, employees: CreateEmployeeDto[], changedBy?: string) {
    const results = { success: 0, failed: 0, errors: [] as any[] }
    for (const emp of employees) {
      try {
        await this.createEmployee(tenantId, emp, changedBy)
        results.success++
      } catch (e: any) {
        results.failed++
        results.errors.push({ email: emp.email, error: e.message })
      }
    }
    return results
  }
}
