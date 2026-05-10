import { IsString, IsEmail, IsOptional, IsDateString, IsIn } from 'class-validator'

export class CreateEmployeeDto {
  @IsString() firstName: string
  @IsString() lastName: string
  @IsEmail() email: string
  @IsOptional() @IsString() phone?: string
  @IsString() departmentId: string
  @IsString() positionId: string
  @IsOptional() @IsString() managerId?: string
  @IsDateString() startDate: string
  @IsIn(['permanent', 'temporary', 'contractor']) contractType: string
  @IsOptional() @IsString() nationalId?: string
  @IsOptional() emergencyContact?: { name: string; phone: string; relationship: string }
}
