import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('form_submissions')
export class FormSubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  @Index()
  templateId: string

  @Column()
  submittedById: string

  @Column({ nullable: true })
  @Index()
  siteId: string

  @Column({ type: 'jsonb', default: '{}' })
  data: object

  @Column({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.SUBMITTED })
  status: SubmissionStatus

  @Column({ nullable: true })
  reviewedById: string

  @Column({ nullable: true, type: 'text' })
  reviewNotes: string

  @Column({ nullable: true, type: 'timestamp' })
  reviewedAt: Date

  @CreateDateColumn()
  createdAt: Date
}
