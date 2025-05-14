// Mock environment config before imports
jest.mock('../../../../../config/env.config', () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
    DATABASE_URL: 'test-db-url',
    JWT_SECRET: 'test-jwt-secret',
  },
}));

// Mock constants for Cloudinary folders
jest.mock('../../../../cloudinary/constants/cloudinary-folders', () => ({
  CLOUDINARY_FOLDERS: {
    PRODUCT_IMAGES: 'products',
  },
}));

// Mock CloudinaryService directly
jest.mock('../../../../cloudinary/cloudinary.service');

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadProductImageUseCase } from '../upload-product-image.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { CloudinaryService } from '../../../../cloudinary/cloudinary.service';
import {
  createMockProduct,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';
import {
  createMockCloudinaryService,
  createMockCloudinaryUploadResult,
} from '../../../__mocks__/cloudinary.mock';

// Create types for the mocks
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;
type MockCloudinaryService = ReturnType<typeof createMockCloudinaryService>;

describe('UploadProductImageUseCase', () => {
  let useCase: UploadProductImageUseCase;
  let mockProductsRepository: MockProductsRepository;
  let mockCloudinaryService: MockCloudinaryService;
  let consoleErrorSpy: jest.SpyInstance;

  // Create a mock buffer for testing
  const mockBuffer = Buffer.from('test image data');

  beforeEach(async () => {
    // Create mock repository and service
    mockProductsRepository = createMockProductsRepository();
    mockCloudinaryService = createMockCloudinaryService();

    // Spy on console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadProductImageUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    useCase = module.get<UploadProductImageUseCase>(UploadProductImageUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should upload an image and update product successfully', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        imageUrl: null,
      });
      const cloudinaryResult = createMockCloudinaryUploadResult();
      const updatedProduct = createMockProduct({
        id: productId,
        imageUrl: cloudinaryResult.secure_url,
      });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockResolvedValue(cloudinaryResult);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(productId, mockBuffer);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(productId, {
        imageUrl: cloudinaryResult.secure_url,
      });
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          imageUrl: cloudinaryResult.secure_url,
        }),
      );
    });

    it('should replace existing image when product already has an image', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        imageUrl:
          'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/products/old-image.jpg',
      });
      const cloudinaryResult = createMockCloudinaryUploadResult();
      const updatedProduct = createMockProduct({
        id: productId,
        imageUrl: cloudinaryResult.secure_url,
      });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockResolvedValue(cloudinaryResult);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);
      mockCloudinaryService.deleteImage.mockResolvedValue({} as any);

      // Act
      const result = await useCase.execute(productId, mockBuffer);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(productId, {
        imageUrl: cloudinaryResult.secure_url,
      });
      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(
        'products/old-image',
      );
      expect(result.imageUrl).toEqual(cloudinaryResult.secure_url);
    });

    it('should handle errors when deleting old image', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        imageUrl:
          'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/products/old-image.jpg',
      });
      const cloudinaryResult = createMockCloudinaryUploadResult();
      const updatedProduct = createMockProduct({
        id: productId,
        imageUrl: cloudinaryResult.secure_url,
      });
      const deleteError = new Error('Failed to delete image');

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockResolvedValue(cloudinaryResult);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);
      mockCloudinaryService.deleteImage.mockRejectedValue(deleteError);

      // Act
      const result = await useCase.execute(productId, mockBuffer);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(productId, {
        imageUrl: cloudinaryResult.secure_url,
      });
      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(
        'products/old-image',
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        'Error deleting old product image:',
        deleteError,
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        'Failed to delete public ID:',
        'products/old-image',
      );
      expect(result.imageUrl).toEqual(cloudinaryResult.secure_url);
    });

    it('should handle invalid image URL formats gracefully', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        imageUrl: 'https://invalid-url-format.jpg', // Invalid format for Cloudinary URLs
      });
      const cloudinaryResult = createMockCloudinaryUploadResult();
      const updatedProduct = createMockProduct({
        id: productId,
        imageUrl: cloudinaryResult.secure_url,
      });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockResolvedValue(cloudinaryResult);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(productId, mockBuffer);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(productId, {
        imageUrl: cloudinaryResult.secure_url,
      });
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
      expect(result.imageUrl).toEqual(cloudinaryResult.secure_url);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 999;
      mockProductsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(productId, mockBuffer)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from Cloudinary service', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });
      const uploadError = new Error('Cloudinary upload error');

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockRejectedValue(uploadError);

      // Act & Assert
      await expect(useCase.execute(productId, mockBuffer)).rejects.toThrow(
        uploadError,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });

    it('should propagate errors from repository update', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });
      const cloudinaryResult = createMockCloudinaryUploadResult();
      const updateError = new Error('Database update error');

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockCloudinaryService.uploadImage.mockResolvedValue(cloudinaryResult);
      mockProductsRepository.update.mockRejectedValue(updateError);

      // Act & Assert
      await expect(useCase.execute(productId, mockBuffer)).rejects.toThrow(
        updateError,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockBuffer,
        'products',
      );
      expect(mockProductsRepository.update).toHaveBeenCalledWith(productId, {
        imageUrl: cloudinaryResult.secure_url,
      });
    });
  });
});
