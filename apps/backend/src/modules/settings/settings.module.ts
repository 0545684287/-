import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'
import { TenantEntity } from '../../database/entities/tenant.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
