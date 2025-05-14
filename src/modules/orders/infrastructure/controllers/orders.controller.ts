import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { OrderResponseDto } from '../../application/dtos/order-response.dto';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

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
}
