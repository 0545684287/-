import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  FAULTY = 'faulty',
  DECOMMISSIONED = 'decommissioned',
}

export enum EquipmentType {
  SAFETY_GEAR = 'safety_gear',
  FIRE_PROTECTION = 'fire_protection',
  FIRST_AID = 'first_aid',
  MACHINERY = 'machinery',
  VEHICLE = 'vehicle',
  ELECTRICAL = 'electrical',
  OTHER = 'other',
}

@Entity('equipment')
export class EquipmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  name: string

  @Column({ type: 'enum', enum: EquipmentType, default: EquipmentType.OTHER })
  type: EquipmentType

  @Column({ nullable: true })
  serialNumber: string

  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.OPERATIONAL })
  status: EquipmentStatus

  @Column({ nullable: true })
  location: string

  @Column({ nullable: true })
  @Index()
  siteId: string

  @Column({ nullable: true })
  assignedToId: string

  @Column({ nullable: true, type: 'date' })
  lastInspectionDate: Date

  @Column({ nullable: true, type: 'date' })
  nextInspectionDate: Date

  @Column({ nullable: true, type: 'date' })
  purchaseDate: Date

  @Column({ nullable: true, type: 'date' })
  warrantyExpiryDate: Date

  @Column({ nullable: true })
  manufacturer: string

  @Column({ nullable: true })
  model: string

  @Column({ nullable: true, type: 'text' })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
