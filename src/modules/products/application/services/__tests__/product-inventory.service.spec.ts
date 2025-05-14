import { Test, TestingModule } from '@nestjs/testing';
import { ProductInventoryService } from '../product-inventory.service';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  createMockProduct,
  createMockDisabledProduct,
  createMockOutOfStockProduct,
  createMockProductsRepository,
  createMockPrismaTransaction,
  createMockPrismaService,
  MockPrismaClient,
} from '../../../__mocks__/product-inventory.mock';

// Type for mock products repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

// Helper function to safely cast our mock to the expected type
const asPrismaTransaction = (
  mock: MockPrismaClient,
): Prisma.TransactionClient => mock as unknown as Prisma.TransactionClient;

describe('ProductInventoryService', () => {
  let service: ProductInventoryService;
  let mockProductsRepository: MockProductsRepository;
  let mockPrismaService: MockPrismaClient;
  let mockPrismaTransaction: MockPrismaClient;

  beforeEach(async () => {
    // Create mocks
    mockPrismaTransaction = createMockPrismaTransaction();
    mockProductsRepository = createMockProductsRepository();
    mockPrismaService = createMockPrismaService(mockPrismaTransaction);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductInventoryService,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductInventoryService>(ProductInventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateProductForOrder', () => {
    it('should return true when product is available and has sufficient stock', async () => {
      // Arrange
      const product = createMockProduct();
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act
      const result = await service.validateProductForOrder(1, 2);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when product is not found', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateProductForOrder(1, 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when product is disabled', async () => {
      // Arrange
      const product = createMockDisabledProduct();
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act & Assert
      await expect(service.validateProductForOrder(1, 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when product is out of stock', async () => {
      // Arrange
      const product = createMockOutOfStockProduct();
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act & Assert
      await expect(service.validateProductForOrder(1, 2)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when requested quantity exceeds available stock', async () => {
      // Arrange
      const product = createMockProduct();
      mockPrismaService.product.findUnique.mockResolvedValue(product);

      // Act & Assert
      await expect(service.validateProductForOrder(1, 10)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('decreaseInventory', () => {
    it('should call productsRepository.decreaseQuantity with correct parameters', async () => {
      // Arrange
      mockProductsRepository.decreaseQuantity.mockResolvedValue(undefined);

      // Act
      await service.decreaseInventory(1, 2);

      // Assert
      expect(mockProductsRepository.decreaseQuantity).toHaveBeenCalledWith(
        1,
        2,
      );
    });
  });

  describe('validateAndDecreaseInventory', () => {
    it('should validate and decrease inventory when using Prisma transaction', async () => {
      // Arrange
      const mockProduct = createMockProduct();
      mockPrismaTransaction.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaTransaction.product.update.mockResolvedValue({
        ...mockProduct,
        quantity: 3,
      });

      // Act
      await service.validateAndDecreaseInventory(
        1,
        2,
        asPrismaTransaction(mockPrismaTransaction),
      );

      // Assert
      expect(mockPrismaTransaction.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaTransaction.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: { decrement: 2 } },
      });
    });

    it('should create a transaction when not provided with one', async () => {
      // Arrange
      const mockProduct = createMockProduct();
      // Need to mock the transaction behavior
      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: MockPrismaClient) => unknown) => {
          // Our implementation of the transaction that simulates how NestJS does it
          return Promise.resolve(callback(mockPrismaTransaction));
        },
      );
      mockPrismaTransaction.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaTransaction.product.update.mockResolvedValue({
        ...mockProduct,
        quantity: 3,
      });

      // Act
      await service.validateAndDecreaseInventory(1, 2);

      // Assert
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      // The transaction delegate should have been called
      expect(mockPrismaTransaction.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw BadRequestException when product validation fails', async () => {
      // Arrange
      mockPrismaTransaction.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateAndDecreaseInventory(
          1,
          2,
          asPrismaTransaction(mockPrismaTransaction),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaTransaction.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaTransaction.product.update).not.toHaveBeenCalled();
    });
  });
});
