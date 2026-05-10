import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum EnrollmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Entity('training_enrollments')
@Index(['tenantId', 'employeeId', 'courseId'], { unique: true })
export class TrainingEnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  @Index()
  employeeId: string

  @Column()
  courseId: string

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus

  @Column({ nullable: true })
  score: number

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date

  @Column({ nullable: true, type: 'timestamp' })
  expiresAt: Date

  @Column({ nullable: true, type: 'timestamp' })
  scheduledAt: Date

  @Column({ nullable: true, type: 'text' })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
