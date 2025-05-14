import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
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

interface RequestWithUser extends Request {
  user: AuthUser;
}

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
    @Request() req: RequestWithUser,
  ): Promise<OrderResponseDto> {
    // Set the user ID from the authenticated user
    // This ensures users can only create orders for themselves
    createOrderDto.userId = req.user.id;

    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: RequestWithUser,
  ): Promise<OrderResponseDto> {
    return this.updateOrderStatusUseCase.execute(
      id,
      updateOrderStatusDto,
      req.user.id,
      req.user.role,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(
    @Request() req: RequestWithUser,
    @Query() query: GetOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.getUserOrdersUseCase.execute(req.user.id, query);
  }

  @Get('business')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  async getBusinessOrders(
    @Request() req: RequestWithUser,
    @Query() query: GetOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    // For super admin, we'd need another approach, possibly requiring a businessId parameter
    // For now, we're just using the user ID which for BUSINESS role is the business ID
    return this.getBusinessOrdersUseCase.execute(req.user.id, query);
  }
}
