import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

@Entity('employee_history')
@Index(['tenantId', 'employeeId'])
export class EmployeeHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tenantId: string

  @Column()
  employeeId: string

  @Column()
  changeType: string // 'department_change' | 'position_change' | 'status_change' | 'salary_change'

  @Column({ type: 'jsonb' })
  before: Record<string, any>

  @Column({ type: 'jsonb' })
  after: Record<string, any>

  @Column({ nullable: true })
  changedBy: string

  @Column({ nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date
}
