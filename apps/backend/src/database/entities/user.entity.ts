import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { UserRole } from '@safetywork/shared'

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  email: string

  @Column({ select: false })
  passwordHash: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole

  @Column({ nullable: true })
  departmentId: string

  @Column({ nullable: true })
  employeeId: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  twoFactorEnabled: boolean

  @Column({ nullable: true, select: false })
  twoFactorSecret: string

  @Column({ default: 'he' })
  language: string

  @Column({ nullable: true })
  lastLoginAt: Date

  @Column({ nullable: true })
  refreshTokenHash: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
