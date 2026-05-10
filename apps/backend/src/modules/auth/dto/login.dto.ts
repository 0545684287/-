import { IsEmail, IsString, IsOptional, Length } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @Length(8, 100)
  password: string

  @IsString()
  tenantSlug: string

  @IsOptional()
  @IsString()
  @Length(6, 6)
  twoFactorCode?: string
}
