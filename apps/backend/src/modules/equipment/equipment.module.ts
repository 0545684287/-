import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EquipmentController } from './equipment.controller'
import { EquipmentService } from './equipment.service'
import { EquipmentEntity } from '../../database/entities/equipment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentEntity])],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
