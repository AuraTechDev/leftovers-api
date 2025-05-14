import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from '../orders.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import {
  createMockPrismaService,
  createMockOrderData,
  createMockOrderWithRelations,
  MockPrismaService,
} from '../../../__mocks__/order-repository.mock';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let mockPrismaService: MockPrismaService;

  beforeEach(async () => {
    // Create a mock of the PrismaService
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      // Arrange
      const orderData = createMockOrderData();
      const expectedOrder = createMockOrderWithRelations();

      mockPrismaService.order.create.mockResolvedValue(expectedOrder);

      // Act
      const result = await repository.create(orderData);

      // Assert
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: orderData,
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrder);
    });
  });

  describe('findAll', () => {
    it('should return all orders when no filters are provided', async () => {
      // Arrange
      const expectedOrders = [createMockOrderWithRelations()];

      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrders);
    });

    it('should filter by userId when provided', async () => {
      // Arrange
      const userId = 1;
      const expectedOrders = [createMockOrderWithRelations({ userId })];

      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      // Act
      const result = await repository.findAll(userId);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrders);
    });

    it('should filter by businessId when provided', async () => {
      // Arrange
      const businessId = 3;
      const expectedOrders = [createMockOrderWithRelations({ businessId })];

      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      // Act
      const result = await repository.findAll(undefined, businessId);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { businessId },
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrders);
    });

    it('should filter by both userId and businessId when provided', async () => {
      // Arrange
      const userId = 1;
      const businessId = 3;
      const expectedOrders = [
        createMockOrderWithRelations({ userId, businessId }),
      ];

      mockPrismaService.order.findMany.mockResolvedValue(expectedOrders);

      // Act
      const result = await repository.findAll(userId, businessId);

      // Assert
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId, businessId },
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrders);
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      // Arrange
      const orderId = 1;
      const expectedOrder = createMockOrderWithRelations();

      mockPrismaService.order.findUnique.mockResolvedValue(expectedOrder);

      // Act
      const result = await repository.findById(orderId);

      // Assert
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrder);
    });

    it('should return null if order not found', async () => {
      // Arrange
      const orderId = 999;
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(orderId);

      // Assert
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      // Arrange
      const orderId = 1;
      const updateData = {
        status: OrderStatus.IN_PROCESS,
      };
      const expectedOrder = createMockOrderWithRelations({
        status: OrderStatus.IN_PROCESS,
      });

      mockPrismaService.order.update.mockResolvedValue(expectedOrder);

      // Act
      const result = await repository.update(orderId, updateData);

      // Assert
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: updateData,
        include: {
          product: true,
          user: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedOrder);
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      // Arrange
      const orderId = 1;
      mockPrismaService.order.delete.mockResolvedValue(undefined);

      // Act
      await repository.delete(orderId);

      // Assert
      expect(mockPrismaService.order.delete).toHaveBeenCalledWith({
        where: { id: orderId },
      });
    });
  });
});
