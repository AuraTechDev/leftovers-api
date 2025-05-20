import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { OrderResponseDto } from '../../application/dtos/order-response.dto';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';
import { Role } from '@prisma/client';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { UpdateOrderStatusDto } from '../../application/dtos/update-order-status.dto';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { GetOrdersQueryDto } from '../../application/dtos/get-orders-query.dto';
import { GetUserOrdersUseCase } from '../../application/use-cases/get-user-orders.use-case';
import { GetBusinessOrdersUseCase } from '../../application/use-cases/get-business-orders.use-case';
import { PaginatedOrdersResponseDto } from '../../application/dtos/paginated-orders-response.dto';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly getUserOrdersUseCase: GetUserOrdersUseCase,
    private readonly getBusinessOrdersUseCase: GetBusinessOrdersUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser('id') userId: number,
  ): Promise<OrderResponseDto> {
    // Set the user ID from the authenticated user
    // This ensures users can only create orders for themselves
    createOrderDto.userId = userId;

    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @GetUser() currentUser: AuthUser,
  ): Promise<OrderResponseDto> {
    return this.updateOrderStatusUseCase.execute(
      id,
      updateOrderStatusDto,
      currentUser.id,
      currentUser.role,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @GetUser('id') userId: number,
    @Query() query: GetOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.getUserOrdersUseCase.execute(userId, query);
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  async getBusinessOrders(
    @GetUser('id') userId: number,
    @Query() query: GetOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    // For super admin, we'd need another approach, possibly requiring a businessId parameter
    // For now, we're just using the user ID which for BUSINESS role is the business ID
    return this.getBusinessOrdersUseCase.execute(userId, query);
  }
}
