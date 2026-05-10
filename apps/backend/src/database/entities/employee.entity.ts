import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('employees')
@Index(['tenantId', 'employeeNumber'], { unique: true })
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  employeeNumber: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column()
  departmentId: string

  @Column()
  positionId: string

  @Column({ nullable: true })
  managerId: string

  // null = employee belongs to all sites (global/corporate role)
  @Column({ nullable: true })
  @Index()
  siteId: string

  @Column({ type: 'date' })
  startDate: Date

  @Column({ type: 'date', nullable: true })
  endDate: Date

  @Column({ default: 'active' })
  status: string

  @Column({ default: 'permanent' })
  contractType: string

  @Column({ nullable: true })
  avatar: string

  @Column({ nullable: true })
  nationalId: string

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
