import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Provider } from '@prisma/client';

export class OAuthLoginDto {
  @IsEnum(Provider)
  @IsNotEmpty()
  provider: Provider;

  @IsString()
  @IsNotEmpty()
  providerId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
