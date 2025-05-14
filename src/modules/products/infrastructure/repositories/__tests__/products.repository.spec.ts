import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from '../products.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  MockPrismaService,
  createMockPrismaService,
  createMockProduct,
} from '../../../__mocks__/products-repository.mock';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let mockPrismaService: MockPrismaService;

  beforeEach(async () => {
    // Create a mock of the PrismaService
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 10.99,
        quantity: 5,
        imageUrl: 'http://example.com/image.jpg',
        isFeatured: false,
        isDisabled: false,
        businessId: 1,
        foodTypeId: 1,
      };
      const expectedProduct = createMockProduct();

      mockPrismaService.product.create.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.create(productData);

      // Assert
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: productData,
        include: {
          foodType: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products when no businessId is provided', async () => {
      // Arrange
      const expectedProducts = [createMockProduct()];

      mockPrismaService.product.findMany.mockResolvedValue(expectedProducts);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { foodType: true },
      });
      expect(result).toEqual(expectedProducts);
    });

    it('should filter by businessId when provided', async () => {
      // Arrange
      const businessId = 1;
      const expectedProducts = [createMockProduct({ businessId })];

      mockPrismaService.product.findMany.mockResolvedValue(expectedProducts);

      // Act
      const result = await repository.findAll(businessId);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { businessId },
        include: { foodType: true },
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      // Arrange
      const productId = 1;
      const expectedProduct = createMockProduct();

      mockPrismaService.product.findUnique.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          foodType: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });

    it('should return null if product not found', async () => {
      // Arrange
      const productId = 999;
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        include: {
          foodType: true,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByBusinessId', () => {
    it('should find products by business id', async () => {
      // Arrange
      const businessId = 1;
      const expectedProducts = [createMockProduct({ businessId })];

      mockPrismaService.product.findMany.mockResolvedValue(expectedProducts);

      // Act
      const result = await repository.findByBusinessId(businessId);

      // Assert
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { businessId },
        include: {
          foodType: true,
        },
      });
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const productId = 1;
      const updateData = {
        name: 'Updated Product',
        price: 15.99,
      };
      const expectedProduct = createMockProduct({
        name: 'Updated Product',
        price: 15.99,
      });

      mockPrismaService.product.update.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.update(productId, updateData);

      // Assert
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
        include: {
          foodType: true,
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = 1;
      mockPrismaService.product.delete.mockResolvedValue(undefined);

      // Act
      await repository.delete(productId);

      // Assert
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('decreaseQuantity', () => {
    it('should decrease a product quantity', async () => {
      // Arrange
      const productId = 1;
      const quantity = 2;
      const expectedProduct = createMockProduct({ quantity: 3 }); // Original was 5, decrease by 2

      mockPrismaService.product.update.mockResolvedValue(expectedProduct);

      // Act
      const result = await repository.decreaseQuantity(productId, quantity);

      // Assert
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });
      expect(result).toEqual(expectedProduct);
    });
  });
});
