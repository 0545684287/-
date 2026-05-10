import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum ActionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ActionStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum ActionCategory {
  SAFETY_HAZARD = 'safety_hazard',
  NEAR_MISS = 'near_miss',
  ACCIDENT = 'accident',
  EQUIPMENT_FAILURE = 'equipment_failure',
  PROCEDURE_VIOLATION = 'procedure_violation',
  ENVIRONMENTAL = 'environmental',
  OTHER = 'other',
}

@Entity('corrective_actions')
export class CorrectiveActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'enum', enum: ActionSeverity, default: ActionSeverity.MEDIUM })
  severity: ActionSeverity

  @Column({ type: 'enum', enum: ActionStatus, default: ActionStatus.OPEN })
  @Index()
  status: ActionStatus

  @Column({ type: 'enum', enum: ActionCategory, default: ActionCategory.OTHER })
  category: ActionCategory

  @Column({ nullable: true })
  @Index()
  siteId: string

  @Column({ nullable: true })
  assignedToId: string

  @Column()
  reportedById: string

  @Column({ nullable: true, type: 'date' })
  dueDate: Date

  @Column({ nullable: true, type: 'timestamp' })
  closedAt: Date

  @Column({ nullable: true, type: 'text' })
  resolutionNotes: string

  @Column({ nullable: true })
  imageUrl: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
