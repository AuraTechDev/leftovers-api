import { Test, TestingModule } from '@nestjs/testing';
import { GetUserOrdersUseCase } from '../get-user-orders.use-case';
import { OrdersRepository } from '../../../infrastructure/repositories/orders.repository';
import { OrderStatus } from '@prisma/client';
import {
  createMockOrdersRepository,
  createMockOrder,
  createMockPaginatedOrdersResult,
} from '../../../__mocks__/order-use-cases.mock';
import { createMockOrdersQueryDto } from '../../../__mocks__/order-controllers.mock';

describe('GetUserOrdersUseCase', () => {
  let useCase: GetUserOrdersUseCase;
  let mockOrdersRepository: ReturnType<typeof createMockOrdersRepository>;

  beforeEach(async () => {
    mockOrdersRepository = createMockOrdersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserOrdersUseCase,
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserOrdersUseCase>(GetUserOrdersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 1;
    const query = createMockOrdersQueryDto();
    const mockOrders = [
      createMockOrder({ userId, status: OrderStatus.PENDING }),
      createMockOrder({ userId, status: OrderStatus.COMPLETED, id: 2 }),
    ];
    const totalOrders = mockOrders.length;

    it('should return paginated user orders', async () => {
      // Arrange
      mockOrdersRepository.findPaginatedByUser.mockResolvedValue(
        createMockPaginatedOrdersResult(mockOrders, totalOrders),
      );

      // Act
      const result = await useCase.execute(userId, query);

      // Assert
      expect(mockOrdersRepository.findPaginatedByUser).toHaveBeenCalledWith(
        userId,
        query.page || 1,
        query.pageSize || 10,
        query.status,
      );

      expect(result.data.length).toBe(totalOrders);
      expect(result.meta.page).toBe(query.page || 1);
      expect(result.meta.pageSize).toBe(query.pageSize || 10);
      expect(result.meta.totalItems).toBe(totalOrders);
      expect(result.meta.totalPages).toBe(
        Math.ceil(totalOrders / (query.pageSize || 10)),
      );
    });

    it('should handle empty results', async () => {
      // Arrange
      mockOrdersRepository.findPaginatedByUser.mockResolvedValue(
        createMockPaginatedOrdersResult([], 0),
      );

      // Act
      const result = await useCase.execute(userId, query);

      // Assert
      expect(mockOrdersRepository.findPaginatedByUser).toHaveBeenCalledWith(
        userId,
        query.page || 1,
        query.pageSize || 10,
        query.status,
      );

      expect(result.data).toEqual([]);
      expect(result.meta.totalItems).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should filter by order status if provided', async () => {
      // Arrange
      const queryWithStatus = createMockOrdersQueryDto({
        status: OrderStatus.PENDING,
      });

      const filteredOrders = mockOrders.filter(
        (order) => order.status === OrderStatus.PENDING,
      );

      mockOrdersRepository.findPaginatedByUser.mockResolvedValue(
        createMockPaginatedOrdersResult(filteredOrders, filteredOrders.length),
      );

      // Act
      const result = await useCase.execute(userId, queryWithStatus);

      // Assert
      expect(mockOrdersRepository.findPaginatedByUser).toHaveBeenCalledWith(
        userId,
        queryWithStatus.page,
        queryWithStatus.pageSize,
        queryWithStatus.status,
      );

      expect(result.data.length).toBe(filteredOrders.length);
      expect(result.meta.totalItems).toBe(filteredOrders.length);
    });
  });
});
