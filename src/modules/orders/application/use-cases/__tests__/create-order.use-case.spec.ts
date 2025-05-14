import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../create-order.use-case';
import { OrdersRepository } from '../../../infrastructure/repositories/orders.repository';
import { ProductInventoryService } from '../../../../products/application/services/product-inventory.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateOrderDto } from '../../dtos/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import {
  MockPrismaClient,
  OrderResult,
  OrderCreateArgs,
  createMockOrder,
  createMockPrismaService,
  createMockOrdersRepository,
  createMockProductInventoryService,
} from '../../../__mocks__/order-use-cases.mock';

// Define types for the test mocks
type MockOrdersRepositoryType = ReturnType<typeof createMockOrdersRepository>;
type MockPrismaServiceType = ReturnType<typeof createMockPrismaService>;
type MockProductInventoryServiceType = ReturnType<
  typeof createMockProductInventoryService
>;

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockPrismaService: MockPrismaServiceType;
  let mockOrdersRepository: MockOrdersRepositoryType;
  let mockProductInventoryService: MockProductInventoryServiceType;

  beforeEach(async () => {
    mockPrismaService = createMockPrismaService();
    mockOrdersRepository = createMockOrdersRepository();
    mockProductInventoryService = createMockProductInventoryService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: OrdersRepository,
          useValue: mockOrdersRepository,
        },
        {
          provide: ProductInventoryService,
          useValue: mockProductInventoryService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const createOrderDto: CreateOrderDto = {
      userId: 1,
      productId: 2,
      businessId: 3,
      quantity: 2,
      pickupTime: new Date(),
    };

    const mockCreatedOrder: OrderResult = createMockOrder();

    it('should create an order successfully', async () => {
      // Arrange
      const prismaTransaction: MockPrismaClient = {
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn().mockResolvedValue(mockCreatedOrder),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: MockPrismaClient) => Promise<OrderResult>) =>
          callback(prismaTransaction),
      );
      mockProductInventoryService.validateAndDecreaseInventory.mockResolvedValue(
        undefined,
      );

      // Act
      const result = await useCase.execute(createOrderDto);

      // Assert
      expect(
        mockProductInventoryService.validateAndDecreaseInventory,
      ).toHaveBeenCalledWith(
        createOrderDto.productId,
        createOrderDto.quantity,
        expect.anything(),
      );
      expect(prismaTransaction.order.create).toHaveBeenCalled();
      expect(result.id).toEqual(mockCreatedOrder.id);
      expect(result.status).toEqual(OrderStatus.PENDING);
    });

    it('should set the default status to PENDING when not provided', async () => {
      // Arrange
      const prismaTransaction: MockPrismaClient = {
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn().mockImplementation((args: OrderCreateArgs) => ({
            ...args.data,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: { id: 2, name: 'Test Product' },
            user: { id: 1, name: 'Test User' },
            business: { id: 3, name: 'Test Business' },
          })),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: MockPrismaClient) => Promise<OrderResult>) =>
          callback(prismaTransaction),
      );
      mockProductInventoryService.validateAndDecreaseInventory.mockResolvedValue(
        undefined,
      );

      // Act
      const result = await useCase.execute(createOrderDto);

      // Assert
      expect(prismaTransaction.order.create).toHaveBeenCalled();
      // Verify order was created with correct properties
      expect(result.status).toEqual(OrderStatus.PENDING);
    });

    it('should use the provided status when available', async () => {
      // Arrange
      const orderDtoWithStatus = {
        ...createOrderDto,
        status: OrderStatus.IN_PROCESS,
      };

      const prismaTransaction: MockPrismaClient = {
        product: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        order: {
          create: jest.fn().mockImplementation((args: OrderCreateArgs) => ({
            ...args.data,
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: { id: 2, name: 'Test Product' },
            user: { id: 1, name: 'Test User' },
            business: { id: 3, name: 'Test Business' },
          })),
        },
      };

      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: MockPrismaClient) => Promise<OrderResult>) =>
          callback(prismaTransaction),
      );
      mockProductInventoryService.validateAndDecreaseInventory.mockResolvedValue(
        undefined,
      );

      // Act
      const result = await useCase.execute(orderDtoWithStatus);

      // Assert
      expect(prismaTransaction.order.create).toHaveBeenCalled();
      // Verify the status was applied correctly
      expect(result.status).toEqual(OrderStatus.IN_PROCESS);
    });

    it('should propagate errors from product inventory validation', async () => {
      // Arrange
      const error = new BadRequestException('Product is out of stock');
      mockProductInventoryService.validateAndDecreaseInventory.mockRejectedValue(
        error,
      );

      // Act & Assert
      await expect(useCase.execute(createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockProductInventoryService.validateAndDecreaseInventory,
      ).toHaveBeenCalled();
    });
  });
});
