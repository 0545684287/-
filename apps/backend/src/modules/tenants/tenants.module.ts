import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantsController } from './tenants.controller'
import { TenantsService } from './tenants.service'
import { TenantEntity } from '../../database/entities/tenant.entity'
import { UserEntity } from '../../database/entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity])],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
