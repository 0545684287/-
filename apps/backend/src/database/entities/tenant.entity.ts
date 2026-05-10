import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  slug: string

  @Column()
  name: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 'he' })
  language: string

  @Column({ default: 'Asia/Jerusalem' })
  timezone: string

  @Column({ type: 'jsonb', default: () => "'{}'" })
  branding: {
    logo?: string
    favicon?: string
    primaryColor: string
    secondaryColor: string
    companyName: string
    customDomain?: string
  }

  @Column({ type: 'jsonb', default: () => "'{}'" })
  subscription: {
    plan: string
    activeUsers: number
    maxUsers: number
    modules: string[]
    billingCycle: string
    pricePerUser: number
    basePrice: number
    nextBillingDate: string
  }

  @Column({ type: 'jsonb', default: () => "'[]'" })
  enabledModules: string[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
