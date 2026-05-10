import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('positions')
export class PositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  title: string

  @Column()
  code: string

  @Column({ nullable: true })
  departmentId: string

  @Column({ type: 'jsonb', default: () => "'[]'" })
  safetyRequirements: string[]

  @Column({ type: 'jsonb', default: () => "'[]'" })
  requiredCertifications: string[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
