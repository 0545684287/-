import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingService } from './training.service'
import { TrainingController } from './training.controller'
import { TrainingCourseEntity } from '../../database/entities/training-course.entity'
import { TrainingEnrollmentEntity } from '../../database/entities/training-enrollment.entity'
import { ReadAndSignDocumentEntity } from '../../database/entities/read-and-sign-document.entity'
import { ReadAndSignSignatureEntity } from '../../database/entities/read-and-sign-signature.entity'

@Module({
  imports: [TypeOrmModule.forFeature([
    TrainingCourseEntity,
    TrainingEnrollmentEntity,
    ReadAndSignDocumentEntity,
    ReadAndSignSignatureEntity,
  ])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
