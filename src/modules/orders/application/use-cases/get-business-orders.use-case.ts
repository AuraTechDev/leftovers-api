import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../infrastructure/repositories/orders.repository';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { PaginatedOrdersResponseDto } from '../dtos/paginated-orders-response.dto';
import { GetOrdersQueryDto } from '../dtos/get-orders-query.dto';

@Injectable()
export class GetBusinessOrdersUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute(
    businessId: number,
    query: GetOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    const { page = 1, pageSize = 10, status } = query;

    const { orders, total } =
      await this.ordersRepository.findPaginatedByBusiness(
        businessId,
        page,
        pageSize,
        status,
      );

    const orderDtos = orders.map((order) => OrderResponseDto.fromEntity(order));

    return PaginatedOrdersResponseDto.create(orderDtos, page, pageSize, total);
  }
}
