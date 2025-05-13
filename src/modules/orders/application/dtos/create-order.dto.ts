import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  businessId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  pickupTime: Date;
}
