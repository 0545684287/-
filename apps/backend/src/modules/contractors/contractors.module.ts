import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContractorsController } from './contractors.controller'
import { ContractorsService } from './contractors.service'
import { ContractorEntity } from '../../database/entities/contractor.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ContractorEntity])],
  controllers: [ContractorsController],
  providers: [ContractorsService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
