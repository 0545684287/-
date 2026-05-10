import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
  Tree, TreeChildren, TreeParent, TreeLevelColumn
} from 'typeorm'

export type SiteType = 'organization' | 'site' | 'building' | 'floor' | 'zone' | 'department_site'

@Entity('sites')
@Tree('closure-table')
export class SiteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index()
  tenantId: string

  @Column()
  name: string

  @Column()
  code: string

  @Column({ default: 'site' })
  type: SiteType

  @Column({ nullable: true })
  managerId: string

  @Column({ nullable: true })
  address: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  phone: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  parentId: string

  @TreeLevelColumn()
  level: number

  @TreeChildren()
  children: SiteEntity[]

  @TreeParent()
  parent: SiteEntity

  @Column({ default: true })
  isActive: boolean

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
