import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUrl,
} from 'class-validator';
import { Role, Provider } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsEnum(Provider)
  @IsOptional()
  provider?: Provider;

  @IsString()
  @IsOptional()
  providerId?: string;

  @IsNumber()
  @IsOptional()
  businessId?: number;
}
