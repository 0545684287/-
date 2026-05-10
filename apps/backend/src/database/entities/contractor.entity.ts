import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum ContractorStatus {
  ACTIVE = 'active',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
}

@Entity('contractors')
export class ContractorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  companyName: string

  @Column()
  contactPerson: string

  @Column()
  email: string

  @Column({ nullable: true })
  phone: string

  @Column({ type: 'enum', enum: ContractorStatus, default: ContractorStatus.PENDING_APPROVAL })
  status: ContractorStatus

  @Column({ nullable: true })
  @Index()
  siteId: string

  @Column({ nullable: true })
  licenseNumber: string

  @Column({ nullable: true, type: 'date' })
  licenseExpiryDate: Date

  @Column({ nullable: true })
  insuranceNumber: string

  @Column({ nullable: true, type: 'date' })
  insuranceExpiryDate: Date

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[]

  @Column({ default: 3 })
  safetyRating: number

  @Column({ nullable: true, type: 'text' })
  notes: string

  @Column({ nullable: true })
  entryPermitUrl: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
