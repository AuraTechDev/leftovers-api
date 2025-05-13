import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFoodTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
