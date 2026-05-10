import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HrController } from './hr.controller'
import { HrService } from './hr.service'
import { EmployeeEntity } from '../../database/entities/employee.entity'
import { DepartmentEntity } from '../../database/entities/department.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity, DepartmentEntity])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
