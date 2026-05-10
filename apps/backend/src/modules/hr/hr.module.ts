import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { HrController } from './hr.controller'
import { HrService } from './hr.service'
import { HrImportService } from './hr-import.service'
import { HrExportService } from './hr-export.service'
import { EmployeeEntity } from '../../database/entities/employee.entity'
import { DepartmentEntity } from '../../database/entities/department.entity'
import { PositionEntity } from '../../database/entities/position.entity'
import { EmployeeHistoryEntity } from '../../database/entities/employee-history.entity'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeEntity, DepartmentEntity, PositionEntity, EmployeeHistoryEntity]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
    StorageModule,
  ],
  controllers: [HrController],
  providers: [HrService, HrImportService, HrExportService],
  exports: [HrService],
})
export class HrModule {}
