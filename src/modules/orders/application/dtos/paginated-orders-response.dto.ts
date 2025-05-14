import { OrderResponseDto } from './order-response.dto';

export class PaginatedOrdersResponseDto {
  data: OrderResponseDto[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };

  static create(
    orders: OrderResponseDto[],
    page: number,
    pageSize: number,
    totalItems: number,
  ): PaginatedOrdersResponseDto {
    const response = new PaginatedOrdersResponseDto();
    response.data = orders;
    response.meta = {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
    return response;
  }
}
