import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsEmail()
  @IsOptional()
  from?: string;
} 