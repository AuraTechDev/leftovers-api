import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.use-case';
import { GetUserOrdersUseCase } from '../../../application/use-cases/get-user-orders.use-case';
import { GetBusinessOrdersUseCase } from '../../../application/use-cases/get-business-orders.use-case';
import { OrderStatus } from '@prisma/client';
import {
  createMockUser,
  createMockBusinessUser,
  createMockOrderDto,
  createMockUpdateOrderStatusDto,
  createMockOrdersQueryDto,
  createMockOrderResponse,
  createMockPaginatedOrdersResponse,
} from '../../../__mocks__/order-controllers.mock';

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
      const mockUser = createMockUser();
      const mockOrderDto = createMockOrderDto();
      const mockResponse = createMockOrderResponse();

      // Setup mocks
      const executeSpy = jest
        .spyOn(createOrderUseCase, 'execute')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.createOrder(mockOrderDto, mockUser);

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
      const updateDto = createMockUpdateOrderStatusDto();
      const mockUser = createMockBusinessUser();
      const mockResponse = createMockOrderResponse({
        status: OrderStatus.IN_PROCESS,
      });

      // Setup mocks
      const executeSpy = jest
        .spyOn(updateOrderStatusUseCase, 'execute')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.updateOrderStatus(
        orderId,
        updateDto,
        mockUser,
      );

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
      const mockUser = createMockUser();
      const query = createMockOrdersQueryDto();
      const mockResponse = createMockPaginatedOrdersResponse();

      // Setup mocks
      const executeSpy = jest
        .spyOn(getUserOrdersUseCase, 'execute')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.getUserOrders(mockUser, query);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(mockUser.id, query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBusinessOrders', () => {
    it('should call getBusinessOrdersUseCase with business ID and query parameters', async () => {
      // Mock data
      const mockUser = createMockBusinessUser();
      const query = createMockOrdersQueryDto();
      const mockResponse = createMockPaginatedOrdersResponse();

      // Setup mocks
      const executeSpy = jest
        .spyOn(getBusinessOrdersUseCase, 'execute')
        .mockResolvedValue(mockResponse);

      // Execute
      const result = await controller.getBusinessOrders(mockUser, query);

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(mockUser.id, query);
      expect(result).toEqual(mockResponse);
    });
  });
});
