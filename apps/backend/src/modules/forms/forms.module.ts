import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FormsController } from './forms.controller'
import { FormsService } from './forms.service'
import { FormTemplateEntity } from '../../database/entities/form-template.entity'
import { FormSubmissionEntity } from '../../database/entities/form-submission.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FormTemplateEntity, FormSubmissionEntity])],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
