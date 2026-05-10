import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { TenantEntity } from '../../database/entities/tenant.entity'
import { UserEntity } from '../../database/entities/user.entity'
import { AuditLogEntity } from '../../database/entities/audit-log.entity'
import { EmployeeEntity } from '../../database/entities/employee.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantEntity,
      UserEntity,
      AuditLogEntity,
      EmployeeEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
