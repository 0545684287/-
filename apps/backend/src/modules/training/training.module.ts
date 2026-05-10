import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TrainingService } from './training.service'
import { TrainingController } from './training.controller'
import { TrainingCourseEntity } from '../../database/entities/training-course.entity'
import { TrainingEnrollmentEntity } from '../../database/entities/training-enrollment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TrainingCourseEntity, TrainingEnrollmentEntity])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
