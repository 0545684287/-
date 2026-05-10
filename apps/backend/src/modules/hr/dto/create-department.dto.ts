import { IsString, IsOptional } from 'class-validator'

export class CreateDepartmentDto {
  @IsString() name: string
  @IsString() code: string
  @IsOptional() @IsString() managerId?: string
  @IsOptional() @IsString() parentDepartmentId?: string
}
