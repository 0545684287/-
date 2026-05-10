import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { UserRole } from '@safetywork/shared'

@Entity('user_site_roles')
@Index(['tenantId', 'userId', 'siteId'], { unique: true })
export class UserSiteRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  tenantId: string

  @Column()
  userId: string

  @Column()
  siteId: string

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date
}
