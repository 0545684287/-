import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum TrainingType {
  SAFETY = 'safety',
  PROCEDURE = 'procedure',
  EQUIPMENT = 'equipment',
  REGULATORY = 'regulatory',
  EMERGENCY = 'emergency',
}

@Entity('training_courses')
export class TrainingCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  title: string

  @Column({ nullable: true, type: 'text' })
  description: string

  @Column({ type: 'enum', enum: TrainingType, default: TrainingType.SAFETY })
  type: TrainingType

  @Column({ default: 60 })
  durationMinutes: number

  @Column({ nullable: true })
  certificationValidityDays: number

  @Column({ default: true })
  isMandatory: boolean

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  siteId: string

  @Column({ nullable: true })
  instructorName: string

  @Column({ nullable: true })
  externalUrl: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
