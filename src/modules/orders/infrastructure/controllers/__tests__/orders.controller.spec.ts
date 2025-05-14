import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.use-case';
import { GetUserOrdersUseCase } from '../../../application/use-cases/get-user-orders.use-case';
import { GetBusinessOrdersUseCase } from '../../../application/use-cases/get-business-orders.use-case';
import { Role, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../../../application/dtos/create-order.dto';
import { UpdateOrderStatusDto } from '../../../application/dtos/update-order-status.dto';
import { OrderResponseDto } from '../../../application/dtos/order-response.dto';
import { PaginatedOrdersResponseDto } from '../../../application/dtos/paginated-orders-response.dto';
import { AuthUser } from '../../../../auth/domain/interfaces/user.interface';

describe('OrdersController', () => {
  let controller: OrdersController;
  let createOrderUseCase: CreateOrderUseCase;
  let updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  let getUserOrdersUseCase: GetUserOrdersUseCase;
  let getBusinessOrdersUseCase: GetBusinessOrdersUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateOrderStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetUserOrdersUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetBusinessOrdersUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    updateOrderStatusUseCase = module.get<UpdateOrderStatusUseCase>(
      UpdateOrderStatusUseCase,
    );
    getUserOrdersUseCase =
      module.get<GetUserOrdersUseCase>(GetUserOrdersUseCase);
    getBusinessOrdersUseCase = module.get<GetBusinessOrdersUseCase>(
      GetBusinessOrdersUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should set userId from authenticated user and call createOrderUseCase', async () => {
      // Mock data
      const mockUser: AuthUser = {
        id: 123,
        email: 'test@example.com',
        role: Role.USER,
        name: 'Test User',
        provider: 'LOCAL',
      };
      const mockOrderDto: Partial<CreateOrderDto> = {
        productId: 1,
        businessId: 2,
        quantity: 3,
        pickupTime: new Date(),
      };
      const mockResponse: Partial<OrderResponseDto> = { id: 1 };

      // Setup mocks
      const executeSpy = jest
        .spyOn(createOrderUseCase, 'execute')
        .mockResolvedValue(mockResponse as OrderResponseDto);

      // Execute
      const result = await controller.createOrder(
        mockOrderDto as CreateOrderDto,
        { user: mockUser } as unknown as any,
      );

      // Assert
      expect(mockOrderDto.userId).toEqual(mockUser.id);
      expect(executeSpy).toHaveBeenCalledWith(mockOrderDto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateOrderStatus', () => {
    it('should call updateOrderStatusUseCase with correct parameters', async () => {
      // Mock data
      const orderId = 1;
      const updateDto: UpdateOrderStatusDto = {
        status: OrderStatus.IN_PROCESS,
      };
      const mockUser: AuthUser = {
        id: 2,
        email: 'business@example.com',
        role: Role.BUSINESS,
        name: 'Business User',
        provider: 'LOCAL',
      };
      const mockResponse: Partial<OrderResponseDto> = {
        id: 1,
        status: OrderStatus.IN_PROCESS,
      };

      // Setup mocks
      const executeSpy = jest
        .spyOn(updateOrderStatusUseCase, 'execute')
        .mockResolvedValue(mockResponse as OrderResponseDto);

      // Execute
      const result = await controller.updateOrderStatus(orderId, updateDto, {
        user: mockUser,
      } as unknown as any);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(
        orderId,
        updateDto,
        mockUser.id,
        mockUser.role,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserOrders', () => {
    it('should call getUserOrdersUseCase with user ID and query parameters', async () => {
      // Mock data
      const userId = 123;
      const query = { page: 1, pageSize: 10 };
      const mockUser: AuthUser = {
        id: userId,
        email: 'user@example.com',
        role: Role.USER,
        name: 'Regular User',
        provider: 'LOCAL',
      };
      const mockResponse: Partial<PaginatedOrdersResponseDto> = {
        data: [{ id: 1 } as OrderResponseDto, { id: 2 } as OrderResponseDto],
        meta: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 },
      };

      // Setup mocks
      const executeSpy = jest
        .spyOn(getUserOrdersUseCase, 'execute')
        .mockResolvedValue(mockResponse as PaginatedOrdersResponseDto);

      // Execute
      const result = await controller.getUserOrders(
        { user: mockUser } as unknown as any,
        query as any,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBusinessOrders', () => {
    it('should call getBusinessOrdersUseCase with business ID and query parameters', async () => {
      // Mock data
      const businessId = 2;
      const query = { page: 1, pageSize: 10 };
      const mockUser: AuthUser = {
        id: businessId,
        email: 'business@example.com',
        role: Role.BUSINESS,
        name: 'Business Owner',
        provider: 'LOCAL',
      };
      const mockResponse: Partial<PaginatedOrdersResponseDto> = {
        data: [{ id: 1 } as OrderResponseDto, { id: 2 } as OrderResponseDto],
        meta: { page: 1, pageSize: 10, totalItems: 2, totalPages: 1 },
      };

      // Setup mocks
      const executeSpy = jest
        .spyOn(getBusinessOrdersUseCase, 'execute')
        .mockResolvedValue(mockResponse as PaginatedOrdersResponseDto);

      // Execute
      const result = await controller.getBusinessOrders(
        { user: mockUser } as unknown as any,
        query as any,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(businessId, query);
      expect(result).toEqual(mockResponse);
    });
  });
});
