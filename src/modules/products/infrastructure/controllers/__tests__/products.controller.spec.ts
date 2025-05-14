import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProductsController } from '../products.controller';

// Import use cases
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from '../../../application/use-cases/get-all-products.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from '../../../application/use-cases/upload-product-image.use-case';
import { ToggleProductPropertyUseCase } from '../../../application/use-cases/toggle-product-property.use-case';

// Import food type use cases
import { CreateFoodTypeUseCase } from '../../../application/use-cases/create-food-type.use-case';
import { GetAllFoodTypesUseCase } from '../../../application/use-cases/get-all-food-types.use-case';
import { UpdateFoodTypeUseCase } from '../../../application/use-cases/update-food-type.use-case';
import { DeleteFoodTypeUseCase } from '../../../application/use-cases/delete-food-type.use-case';

// Import repositories
import { UsersRepository } from '../../../../users/infrastructure/repositories/users.repository';
import { BusinessRepository } from '../../../../business/infrastructure/repositories/business.repository';

// Import mocks
import {
  createMockProductUseCases,
  createMockFoodTypeUseCases,
  createMockRepositories,
  createMockRequestWithUser,
  createMockAuthUser,
  createMockProductsArray,
  createMockFoodTypesArray,
  createMockUserWithBusiness,
  createMockUploadedFile,
  UploadedFileType,
} from '../../../__mocks__/products-controller.mock';
import { createMockProductResponseDto } from '../../../__mocks__/product-use-cases.mock';
import { createMockFoodTypeResponseDto } from '../../../__mocks__/food-type.mock';
import { createMockCreateProductDto } from '../../../__mocks__/product-use-cases.mock';

describe('ProductsController', () => {
  let controller: ProductsController;

  // Mock use cases
  const mockProductUseCases = createMockProductUseCases();
  const mockFoodTypeUseCases = createMockFoodTypeUseCases();
  const mockRepositories = createMockRepositories();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        // Product use cases
        {
          provide: CreateProductUseCase,
          useValue: mockProductUseCases.createProductUseCase,
        },
        {
          provide: GetAllProductsUseCase,
          useValue: mockProductUseCases.getAllProductsUseCase,
        },
        {
          provide: GetProductUseCase,
          useValue: mockProductUseCases.getProductUseCase,
        },
        {
          provide: UpdateProductUseCase,
          useValue: mockProductUseCases.updateProductUseCase,
        },
        {
          provide: DeleteProductUseCase,
          useValue: mockProductUseCases.deleteProductUseCase,
        },
        {
          provide: UploadProductImageUseCase,
          useValue: mockProductUseCases.uploadProductImageUseCase,
        },
        {
          provide: ToggleProductPropertyUseCase,
          useValue: mockProductUseCases.toggleProductPropertyUseCase,
        },

        // Food type use cases
        {
          provide: CreateFoodTypeUseCase,
          useValue: mockFoodTypeUseCases.createFoodTypeUseCase,
        },
        {
          provide: GetAllFoodTypesUseCase,
          useValue: mockFoodTypeUseCases.getAllFoodTypesUseCase,
        },
        {
          provide: UpdateFoodTypeUseCase,
          useValue: mockFoodTypeUseCases.updateFoodTypeUseCase,
        },
        {
          provide: DeleteFoodTypeUseCase,
          useValue: mockFoodTypeUseCases.deleteFoodTypeUseCase,
        },

        // Repositories
        {
          provide: UsersRepository,
          useValue: mockRepositories.usersRepository,
        },
        {
          provide: BusinessRepository,
          useValue: mockRepositories.businessRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Product Endpoints', () => {
    describe('createProduct', () => {
      it('should create a product when user is SUPER_ADMIN', async () => {
        // Arrange
        const mockProduct = createMockProductResponseDto();
        const createProductDto = createMockCreateProductDto();
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.createProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.createProduct(createProductDto, req);

        // Assert
        expect(
          mockProductUseCases.createProductUseCase.execute,
        ).toHaveBeenCalledWith(createProductDto);
        expect(result).toEqual(mockProduct);
      });

      it('should create a product when BUSINESS user owns the business', async () => {
        // Arrange
        const mockProduct = createMockProductResponseDto();
        const createProductDto = createMockCreateProductDto({ businessId: 1 });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );
        mockProductUseCases.createProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.createProduct(createProductDto, req);

        // Assert
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.createProductUseCase.execute,
        ).toHaveBeenCalledWith(createProductDto);
        expect(result).toEqual(mockProduct);
      });

      it('should throw ForbiddenException when BUSINESS user tries to create product for another business', async () => {
        // Arrange
        const createProductDto = createMockCreateProductDto({ businessId: 2 });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );

        // Act & Assert
        await expect(
          controller.createProduct(createProductDto, req),
        ).rejects.toThrow(ForbiddenException);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.createProductUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });

    describe('getAllProducts', () => {
      it('should return all products', async () => {
        // Arrange
        const mockProducts = createMockProductsArray();
        mockProductUseCases.getAllProductsUseCase.execute.mockResolvedValue(
          mockProducts,
        );

        // Act
        const result = await controller.getAllProducts();

        // Assert
        expect(
          mockProductUseCases.getAllProductsUseCase.execute,
        ).toHaveBeenCalled();
        expect(result).toEqual(mockProducts);
      });

      it('should return products for specific business when businessId is provided', async () => {
        // Arrange
        const businessId = '1';
        const mockProducts = createMockProductsArray();
        mockProductUseCases.getAllProductsUseCase.execute.mockResolvedValue(
          mockProducts,
        );

        // Act
        const result = await controller.getAllProducts(businessId);

        // Assert
        expect(
          mockProductUseCases.getAllProductsUseCase.execute,
        ).toHaveBeenCalledWith(parseInt(businessId, 10));
        expect(result).toEqual(mockProducts);
      });
    });

    describe('getProductById', () => {
      it('should return a product by id', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.getProductById(productId);

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(result).toEqual(mockProduct);
      });

      it('should throw NotFoundException when product does not exist', async () => {
        // Arrange
        const productId = 999;
        mockProductUseCases.getProductUseCase.execute.mockRejectedValue(
          new NotFoundException(`Product with ID ${productId} not found`),
        );

        // Act & Assert
        await expect(controller.getProductById(productId)).rejects.toThrow(
          NotFoundException,
        );
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
      });
    });

    describe('updateProduct', () => {
      it('should update a product when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const updateProductDto = { name: 'Updated Product' };
        const mockProduct = createMockProductResponseDto({
          id: productId,
          name: 'Updated Product',
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.updateProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.updateProduct(
          productId,
          updateProductDto,
          req,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.updateProductUseCase.execute,
        ).toHaveBeenCalledWith(productId, updateProductDto);
        expect(result).toEqual(mockProduct);
      });

      it('should update a product when BUSINESS user owns the business', async () => {
        // Arrange
        const productId = 1;
        const updateProductDto = { name: 'Updated Product' };
        const mockProduct = createMockProductResponseDto({
          id: productId,
          name: 'Updated Product',
          businessId: 1,
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );
        mockProductUseCases.updateProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.updateProduct(
          productId,
          updateProductDto,
          req,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.updateProductUseCase.execute,
        ).toHaveBeenCalledWith(productId, updateProductDto);
        expect(result).toEqual(mockProduct);
      });

      it('should throw ForbiddenException when BUSINESS user tries to update product from another business', async () => {
        // Arrange
        const productId = 1;
        const updateProductDto = { name: 'Updated Product' };
        const mockProduct = createMockProductResponseDto({
          id: productId,
          name: 'Updated Product',
          businessId: 2, // Different business
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );

        // Act & Assert
        await expect(
          controller.updateProduct(productId, updateProductDto, req),
        ).rejects.toThrow(ForbiddenException);
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.updateProductUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });

    describe('deleteProduct', () => {
      it('should delete a product when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.deleteProductUseCase.execute.mockResolvedValue(
          undefined,
        );

        // Act
        await controller.deleteProduct(productId, req);

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.deleteProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
      });

      it('should delete a product when BUSINESS user owns the business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 1,
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );
        mockProductUseCases.deleteProductUseCase.execute.mockResolvedValue(
          undefined,
        );

        // Act
        await controller.deleteProduct(productId, req);

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.deleteProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
      });

      it('should throw ForbiddenException when BUSINESS user tries to delete product from another business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 2, // Different business
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );

        // Act & Assert
        await expect(controller.deleteProduct(productId, req)).rejects.toThrow(
          ForbiddenException,
        );
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.deleteProductUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });

    describe('uploadProductImage', () => {
      it('should upload product image when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const file = createMockUploadedFile();
        const mockProduct = createMockProductResponseDto({
          id: productId,
          imageUrl: 'https://example.com/image.jpg',
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.uploadProductImageUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.uploadProductImage(
          productId,
          file,
          req,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.uploadProductImageUseCase.execute,
        ).toHaveBeenCalledWith(productId, file.buffer);
        expect(result).toEqual(mockProduct);
      });

      it('should upload product image when BUSINESS user owns the business', async () => {
        // Arrange
        const productId = 1;
        const file = createMockUploadedFile();
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 1,
          imageUrl: 'https://example.com/image.jpg',
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.BUSINESS, businessId: 1 }),
        });
        const userWithBusiness = createMockUserWithBusiness();

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockRepositories.usersRepository.findById.mockResolvedValue(
          userWithBusiness,
        );
        mockProductUseCases.uploadProductImageUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.uploadProductImage(
          productId,
          file,
          req,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.uploadProductImageUseCase.execute,
        ).toHaveBeenCalledWith(productId, file.buffer);
        expect(result).toEqual(mockProduct);
      });

      it('should throw NotFoundException when no file is uploaded', async () => {
        // Arrange
        const productId = 1;
        const file = null as unknown as UploadedFileType;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act & Assert
        await expect(
          controller.uploadProductImage(productId, file, req),
        ).rejects.toThrow(NotFoundException);
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.uploadProductImageUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });

    describe('toggleProductFeature', () => {
      it('should toggle product feature when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          isFeatured: true,
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.toggleProductFeature(productId, req);

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isFeatured');
        expect(result).toEqual(mockProduct);
      });
    });

    describe('toggleProductDisable', () => {
      it('should toggle product disable status when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          isDisabled: true,
        });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act
        const result = await controller.toggleProductDisable(productId, req);

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isDisabled');
        expect(result).toEqual(mockProduct);
      });
    });
  });

  describe('Food Type Endpoints', () => {
    describe('createFoodType', () => {
      it('should create a food type as SUPER_ADMIN', async () => {
        // Arrange
        const createFoodTypeDto = { name: 'Vegetarian' };
        const mockFoodType = createMockFoodTypeResponseDto();

        mockFoodTypeUseCases.createFoodTypeUseCase.execute.mockResolvedValue(
          mockFoodType,
        );

        // Act
        const result = await controller.createFoodType(createFoodTypeDto);

        // Assert
        expect(
          mockFoodTypeUseCases.createFoodTypeUseCase.execute,
        ).toHaveBeenCalledWith(createFoodTypeDto);
        expect(result).toEqual(mockFoodType);
      });
    });

    describe('getAllFoodTypes', () => {
      it('should return all food types', async () => {
        // Arrange
        const mockFoodTypes = createMockFoodTypesArray();
        mockFoodTypeUseCases.getAllFoodTypesUseCase.execute.mockResolvedValue(
          mockFoodTypes,
        );

        // Act
        const result = await controller.getAllFoodTypes();

        // Assert
        expect(
          mockFoodTypeUseCases.getAllFoodTypesUseCase.execute,
        ).toHaveBeenCalled();
        expect(result).toEqual(mockFoodTypes);
      });
    });

    describe('updateFoodType', () => {
      it('should update a food type', async () => {
        // Arrange
        const foodTypeId = 1;
        const updateFoodTypeDto = { name: 'Updated Food Type' };
        const mockFoodType = createMockFoodTypeResponseDto({
          id: foodTypeId,
          name: 'Updated Food Type',
        });

        mockFoodTypeUseCases.updateFoodTypeUseCase.execute.mockResolvedValue(
          mockFoodType,
        );

        // Act
        const result = await controller.updateFoodType(
          foodTypeId,
          updateFoodTypeDto,
        );

        // Assert
        expect(
          mockFoodTypeUseCases.updateFoodTypeUseCase.execute,
        ).toHaveBeenCalledWith(foodTypeId, updateFoodTypeDto);
        expect(result).toEqual(mockFoodType);
      });
    });

    describe('deleteFoodType', () => {
      it('should delete a food type', async () => {
        // Arrange
        const foodTypeId = 1;
        mockFoodTypeUseCases.deleteFoodTypeUseCase.execute.mockResolvedValue(
          undefined,
        );

        // Act
        await controller.deleteFoodType(foodTypeId);

        // Assert
        expect(
          mockFoodTypeUseCases.deleteFoodTypeUseCase.execute,
        ).toHaveBeenCalledWith(foodTypeId);
      });
    });
  });
});
