import { IsString, IsOptional, IsArray } from 'class-validator'

export class CreatePositionDto {
  @IsString() title: string
  @IsString() code: string
  @IsOptional() @IsString() departmentId?: string
  @IsOptional() @IsArray() safetyRequirements?: string[]
  @IsOptional() @IsArray() requiredCertifications?: string[]
}
