import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class GetOrdersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus;
}
