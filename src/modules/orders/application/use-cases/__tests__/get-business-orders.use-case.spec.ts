import { Test, TestingModule } from '@nestjs/testing';
import { GetBusinessOrdersUseCase } from '../get-business-orders.use-case';
import { OrdersRepository } from '../../../infrastructure/repositories/orders.repository';
import { OrderStatus } from '@prisma/client';
import {
  createMockOrdersRepository,
  createMockOrder,
  createMockPaginatedOrdersResult,
} from '../../../__mocks__/order-use-cases.mock';
import { createMockOrdersQueryDto } from '../../../__mocks__/order-controllers.mock';

describe('GetBusinessOrdersUseCase', () => {
  let useCase: GetBusinessOrdersUseCase;
  let mockOrdersRepository: ReturnType<typeof createMockOrdersRepository>;

  beforeEach(async () => {
    mockOrdersRepository = createMockOrdersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBusinessOrdersUseCase,
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetBusinessOrdersUseCase>(GetBusinessOrdersUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const businessId = 3;
    const query = createMockOrdersQueryDto();
    const mockOrders = [
      createMockOrder({ businessId, status: OrderStatus.PENDING }),
      createMockOrder({ businessId, status: OrderStatus.IN_PROCESS, id: 2 }),
      createMockOrder({ businessId, status: OrderStatus.COMPLETED, id: 3 }),
    ];
    const totalOrders = mockOrders.length;

    it('should return paginated business orders', async () => {
      // Arrange
      mockOrdersRepository.findPaginatedByBusiness.mockResolvedValue(
        createMockPaginatedOrdersResult(mockOrders, totalOrders),
      );

      // Act
      const result = await useCase.execute(businessId, query);

      // Assert
      expect(mockOrdersRepository.findPaginatedByBusiness).toHaveBeenCalledWith(
        businessId,
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
      mockOrdersRepository.findPaginatedByBusiness.mockResolvedValue(
        createMockPaginatedOrdersResult([], 0),
      );

      // Act
      const result = await useCase.execute(businessId, query);

      // Assert
      expect(mockOrdersRepository.findPaginatedByBusiness).toHaveBeenCalledWith(
        businessId,
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

      mockOrdersRepository.findPaginatedByBusiness.mockResolvedValue(
        createMockPaginatedOrdersResult(filteredOrders, filteredOrders.length),
      );

      // Act
      const result = await useCase.execute(businessId, queryWithStatus);

      // Assert
      expect(mockOrdersRepository.findPaginatedByBusiness).toHaveBeenCalledWith(
        businessId,
        queryWithStatus.page || 1,
        queryWithStatus.pageSize || 10,
        queryWithStatus.status,
      );

      expect(result.data.length).toBe(filteredOrders.length);
      expect(result.meta.totalItems).toBe(filteredOrders.length);
    });
  });
});
