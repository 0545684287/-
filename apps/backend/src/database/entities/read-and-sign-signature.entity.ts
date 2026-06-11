import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('read_and_sign_signatures')
@Index(['tenantId', 'documentId', 'employeeId'], { unique: true })
export class ReadAndSignSignatureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  @Index()
  documentId: string

  @Column()
  employeeId: string

  @Column({ nullable: true })
  employeeName: string

  @Column({ default: 'pending' })
  status: string

  @Column({ nullable: true, type: 'timestamp' })
  signedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
