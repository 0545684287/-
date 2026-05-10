import { IsOptional, IsString, IsInt, IsIn, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class EmployeeQueryDto {
  @IsOptional() @IsString() search?: string
  @IsOptional() @IsString() siteId?: string
  @IsOptional() @IsString() departmentId?: string
  @IsOptional() @IsIn(['active', 'inactive', 'on_leave']) status?: string
  @IsOptional() @IsIn(['permanent', 'temporary', 'contractor']) contractType?: string
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20
  @IsOptional() @IsString() sortBy?: string = 'createdAt'
  @IsOptional() @IsIn(['ASC', 'DESC']) sortDir?: 'ASC' | 'DESC' = 'DESC'
}
