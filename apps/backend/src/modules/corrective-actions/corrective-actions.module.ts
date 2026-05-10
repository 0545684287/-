import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CorrectiveActionsController } from './corrective-actions.controller'
import { CorrectiveActionsService } from './corrective-actions.service'
import { CorrectiveActionEntity } from '../../database/entities/corrective-action.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CorrectiveActionEntity])],
  controllers: [CorrectiveActionsController],
  providers: [CorrectiveActionsService],
  exports: [CorrectiveActionsService],
})
export class CorrectiveActionsModule {}
