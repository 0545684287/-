import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('departments')
export class DepartmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  name: string

  @Column()
  code: string

  @Column({ nullable: true })
  managerId: string

  @Column({ nullable: true })
  parentDepartmentId: string

  // null = cross-cutting department (visible across all sites)
  @Column({ nullable: true })
  siteId: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
