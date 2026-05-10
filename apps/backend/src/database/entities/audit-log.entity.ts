import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

@Entity('audit_logs')
@Index(['tenantId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  tenantId: string

  @Column({ nullable: true })
  userId: string

  @Column()
  action: string

  @Column()
  module: string

  @Column({ nullable: true })
  resourceId: string

  @Column({ nullable: true })
  resourceType: string

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, any>

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, any>

  @Column({ nullable: true })
  ipAddress: string

  @Column({ nullable: true })
  userAgent: string

  @Column({ default: false })
  isSuspicious: boolean

  @CreateDateColumn()
  createdAt: Date
}
