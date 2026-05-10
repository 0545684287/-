import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum FormCategory {
  SAFETY_INSPECTION = 'safety_inspection',
  INCIDENT_REPORT = 'incident_report',
  RISK_ASSESSMENT = 'risk_assessment',
  PERMIT_TO_WORK = 'permit_to_work',
  TOOLBOX_TALK = 'toolbox_talk',
  CHECKLIST = 'checklist',
  OTHER = 'other',
}

@Entity('form_templates')
export class FormTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  title: string

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ type: 'enum', enum: FormCategory, default: FormCategory.CHECKLIST })
  category: FormCategory

  @Column({ type: 'jsonb', default: '[]' })
  fields: object[]

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 1 })
  version: number

  @Column({ nullable: true })
  createdById: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
