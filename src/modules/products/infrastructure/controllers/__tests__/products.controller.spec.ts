import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ProductsController } from '../products.controller';
import { UploadedFileType } from '../../../../cloudinary/interfaces/file-upload.interface';

// Import use cases
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from '../../../application/use-cases/get-all-products.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from '../../../application/use-cases/upload-product-image.use-case';
import { ToggleProductPropertyUseCase } from '../../../application/use-cases/toggle-product-property.use-case';

// Import repositories
import { UsersRepository } from '../../../../users/infrastructure/repositories/users.repository';
import { BusinessRepository } from '../../../../business/infrastructure/repositories/business.repository';

// Import mocks
import {
  createMockProductUseCases,
  createMockRepositories,
  createMockRequestWithUser,
  createMockAuthUser,
  createMockProductsArray,
  createMockUserWithBusiness,
  createMockUploadedFile,
} from '../../../__mocks__/products-controller.mock';
import { createMockProductResponseDto } from '../../../__mocks__/product-use-cases.mock';
import { createMockCreateProductDto } from '../../../__mocks__/product-use-cases.mock';

describe('ProductsController', () => {
  let controller: ProductsController;

  // Mock use cases
  const mockProductUseCases = createMockProductUseCases();
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
        const result = await controller.createProduct(
          createProductDto,
          req.user,
        );

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
        const result = await controller.createProduct(
          createProductDto,
          req.user,
        );

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
          controller.createProduct(createProductDto, req.user),
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
    });

    describe('updateProduct', () => {
      it('should update a product when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const updateProductDto = { name: 'Updated Product' };
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.updateProductUseCase.execute.mockResolvedValue({
          ...mockProduct,
          ...updateProductDto,
        });

        // Act
        const result = await controller.updateProduct(
          productId,
          updateProductDto,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.updateProductUseCase.execute,
        ).toHaveBeenCalledWith(productId, updateProductDto);
        expect(result).toEqual({ ...mockProduct, ...updateProductDto });
      });

      it('should update a product when BUSINESS user owns the business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 1,
        });
        const updateProductDto = { name: 'Updated Product' };
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
        mockProductUseCases.updateProductUseCase.execute.mockResolvedValue({
          ...mockProduct,
          ...updateProductDto,
        });

        // Act
        const result = await controller.updateProduct(
          productId,
          updateProductDto,
          req.user,
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
        expect(result).toEqual({ ...mockProduct, ...updateProductDto });
      });

      it('should throw ForbiddenException when BUSINESS user tries to update product from another business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 2,
        });
        const updateProductDto = { name: 'Updated Product' };
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
          controller.updateProduct(productId, updateProductDto, req.user),
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
        await controller.deleteProduct(productId, req.user);

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
        await controller.deleteProduct(productId, req.user);

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
          businessId: 2,
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
          controller.deleteProduct(productId, req.user),
        ).rejects.toThrow(ForbiddenException);
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
      it('should upload a product image when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const mockFile = createMockUploadedFile();
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.uploadProductImageUseCase.execute.mockResolvedValue(
          {
            ...mockProduct,
            imageUrl: 'https://example.com/image.jpg',
          },
        );

        // Act
        const result = await controller.uploadProductImage(
          productId,
          mockFile,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.uploadProductImageUseCase.execute,
        ).toHaveBeenCalledWith(productId, mockFile.buffer);
        expect(result).toEqual({
          ...mockProduct,
          imageUrl: 'https://example.com/image.jpg',
        });
      });

      it('should upload a product image when BUSINESS user owns the business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 1,
        });
        const mockFile = createMockUploadedFile();
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
          {
            ...mockProduct,
            imageUrl: 'https://example.com/image.jpg',
          },
        );

        // Act
        const result = await controller.uploadProductImage(
          productId,
          mockFile,
          req.user,
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
        ).toHaveBeenCalledWith(productId, mockFile.buffer);
        expect(result).toEqual({
          ...mockProduct,
          imageUrl: 'https://example.com/image.jpg',
        });
      });

      it('should throw ForbiddenException when BUSINESS user tries to upload image for product from another business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 2,
        });
        const mockFile = createMockUploadedFile();
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
          controller.uploadProductImage(productId, mockFile, req.user),
        ).rejects.toThrow(ForbiddenException);
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.uploadProductImageUseCase.execute,
        ).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when no file is uploaded', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );

        // Act & Assert
        const undefinedFile = undefined as unknown as UploadedFileType;
        await expect(
          controller.uploadProductImage(productId, undefinedFile, req.user),
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
        const mockProduct = createMockProductResponseDto({ id: productId });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          {
            ...mockProduct,
            isFeatured: true,
          },
        );

        // Act
        const result = await controller.toggleProductFeature(
          productId,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isFeatured');
        expect(result).toEqual({ ...mockProduct, isFeatured: true });
      });

      it('should toggle product feature when BUSINESS user owns the business', async () => {
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
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          {
            ...mockProduct,
            isFeatured: true,
          },
        );

        // Act
        const result = await controller.toggleProductFeature(
          productId,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isFeatured');
        expect(result).toEqual({ ...mockProduct, isFeatured: true });
      });

      it('should throw ForbiddenException when BUSINESS user tries to toggle feature for product from another business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 2,
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
          controller.toggleProductFeature(productId, req.user),
        ).rejects.toThrow(ForbiddenException);
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });

    describe('toggleProductDisable', () => {
      it('should toggle product disable when user is SUPER_ADMIN', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({ id: productId });
        const req = createMockRequestWithUser({
          user: createMockAuthUser({ role: Role.SUPER_ADMIN }),
        });

        mockProductUseCases.getProductUseCase.execute.mockResolvedValue(
          mockProduct,
        );
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          {
            ...mockProduct,
            isDisabled: true,
          },
        );

        // Act
        const result = await controller.toggleProductDisable(
          productId,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isDisabled');
        expect(result).toEqual({ ...mockProduct, isDisabled: true });
      });

      it('should toggle product disable when BUSINESS user owns the business', async () => {
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
        mockProductUseCases.toggleProductPropertyUseCase.execute.mockResolvedValue(
          {
            ...mockProduct,
            isDisabled: true,
          },
        );

        // Act
        const result = await controller.toggleProductDisable(
          productId,
          req.user,
        );

        // Assert
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).toHaveBeenCalledWith(productId, 'isDisabled');
        expect(result).toEqual({ ...mockProduct, isDisabled: true });
      });

      it('should throw ForbiddenException when BUSINESS user tries to toggle disable for product from another business', async () => {
        // Arrange
        const productId = 1;
        const mockProduct = createMockProductResponseDto({
          id: productId,
          businessId: 2,
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
          controller.toggleProductDisable(productId, req.user),
        ).rejects.toThrow(ForbiddenException);
        expect(
          mockProductUseCases.getProductUseCase.execute,
        ).toHaveBeenCalledWith(productId);
        expect(mockRepositories.usersRepository.findById).toHaveBeenCalledWith(
          1,
        );
        expect(
          mockProductUseCases.toggleProductPropertyUseCase.execute,
        ).not.toHaveBeenCalled();
      });
    });
  });
});
