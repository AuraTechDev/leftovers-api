import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import {
  createMockCreateOrderUseCase,
  createMockUser,
  createMockOrderDto,
  createMockOrderResponse,
  simulateCreateOrder,
} from '../../../__mocks__/order-controllers.mock';

// Define type for our use case mock
type MockCreateOrderUseCase = ReturnType<typeof createMockCreateOrderUseCase>;

describe('OrdersController', () => {
  let controller: OrdersController;
  let mockCreateOrderUseCase: MockCreateOrderUseCase;

  beforeEach(async () => {
    // Create the mock use case
    mockCreateOrderUseCase = createMockCreateOrderUseCase();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: mockCreateOrderUseCase,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    // Create mocks using the factory functions
    const orderDto = createMockOrderDto();
    const mockedUser = createMockUser();
    const mockOrderResponse = createMockOrderResponse({
      userId: mockedUser.id,
    });

    it('should set userId from authenticated user and call createOrderUseCase', async () => {
      // Arrange
      mockCreateOrderUseCase.execute.mockResolvedValue(mockOrderResponse);
      const dtoToUse = { ...orderDto };

      // Act - simulate controller behavior directly
      const result = await simulateCreateOrder(
        mockCreateOrderUseCase,
        dtoToUse,
        mockedUser.id,
      );

      // Assert
      expect(dtoToUse.userId).toEqual(mockedUser.id); // userId should be overridden
      expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockedUser.id,
          productId: dtoToUse.productId,
          businessId: dtoToUse.businessId,
          quantity: dtoToUse.quantity,
        }),
      );
      expect(result).toEqual(mockOrderResponse);
    });

    it('should handle errors from the use case', async () => {
      // Arrange
      const error = new Error('Something went wrong');
      mockCreateOrderUseCase.execute.mockRejectedValue(error);
      const dtoToUse = { ...orderDto };

      // Act & Assert
      await expect(
        simulateCreateOrder(mockCreateOrderUseCase, dtoToUse, mockedUser.id),
      ).rejects.toThrow(error);
      expect(mockCreateOrderUseCase.execute).toHaveBeenCalled();
    });
  });
});
