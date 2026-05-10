import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindManyOptions } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { UserEntity } from '../../database/entities/user.entity'
import { UserRole } from '@safetywork/shared'

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
  phone?: string
  departmentId?: string
  employeeId?: string
  language?: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  role?: UserRole
  phone?: string
  departmentId?: string
  employeeId?: string
  language?: string
  avatar?: string
}

export interface UserQueryDto {
  search?: string
  role?: UserRole
  isActive?: boolean
  departmentId?: string
  page?: number
  limit?: number
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findAll(tenantId: string, query: UserQueryDto) {
    const { search, role, isActive, departmentId, page = 1, limit = 20 } = query

    const where: any = { tenantId }
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive
    if (departmentId) where.departmentId = departmentId

    const options: FindManyOptions<UserEntity> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    }

    if (search) {
      options.where = [
        { tenantId, firstName: Like(`%${search}%`) },
        { tenantId, lastName: Like(`%${search}%`) },
        { tenantId, email: Like(`%${search}%`) },
      ]
    }

    const [data, total] = await this.userRepo.findAndCount(options)
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(tenantId: string, id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id, tenantId } })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  async create(tenantId: string, dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email, tenantId } })
    if (existing) throw new ConflictException(`User with email "${dto.email}" already exists`)

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = this.userRepo.create({
      ...dto,
      tenantId,
      passwordHash,
      role: dto.role ?? UserRole.EMPLOYEE,
    })
    // Remove plain password from the persisted object
    delete (user as any).password

    return this.userRepo.save(user)
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto): Promise<UserEntity> {
    await this.findOne(tenantId, id)
    await this.userRepo.update({ id, tenantId }, dto)
    return this.findOne(tenantId, id)
  }

  async deactivate(tenantId: string, id: string): Promise<{ success: boolean }> {
    await this.findOne(tenantId, id)
    await this.userRepo.update({ id, tenantId }, { isActive: false })
    return { success: true }
  }

  async changePassword(tenantId: string, id: string, newPassword: string): Promise<{ success: boolean }> {
    await this.findOne(tenantId, id)
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await this.userRepo.update({ id, tenantId }, { passwordHash })
    return { success: true }
  }
}
