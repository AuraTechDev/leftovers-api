import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class SendInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  businessId: number;
}
