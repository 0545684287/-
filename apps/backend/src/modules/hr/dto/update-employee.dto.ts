import { PartialType } from '@nestjs/mapped-types'
import { CreateEmployeeDto } from './create-employee.dto'
import { IsOptional, IsIn } from 'class-validator'

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @IsOptional() @IsIn(['active', 'inactive', 'on_leave']) status?: string
}
