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

// Mock CloudinaryImageService directly
jest.mock('../../../../cloudinary/cloudinary-image.service');

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadProductImageUseCase } from '../upload-product-image.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { CloudinaryImageService } from '../../../../cloudinary/infrastructure/services/cloudinary-image.service';
import { createMockProductsRepository } from '../../../__mocks__/product-use-cases.mock';
import { createMockCloudinaryUploadResult } from '../../../__mocks__/cloudinary.mock';
import { ProductResponseDto } from '../../dtos/product-response.dto';

// Create types for the mocks
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('UploadProductImageUseCase', () => {
  let useCase: UploadProductImageUseCase;
  let mockProductsRepository: MockProductsRepository;
  let cloudinaryImageService: CloudinaryImageService;

  // Create a mock buffer for testing
  const mockBuffer = Buffer.from('test image data');

  beforeEach(async () => {
    // Create mock repository and service
    mockProductsRepository = createMockProductsRepository();

    // Create a simpler mock with just the methods we need
    const mockCloudinaryImageService = {
      uploadEntityImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadProductImageUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        {
          provide: CloudinaryImageService,
          useValue: mockCloudinaryImageService,
        },
      ],
    }).compile();

    useCase = module.get<UploadProductImageUseCase>(UploadProductImageUseCase);
    cloudinaryImageService = module.get(CloudinaryImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should upload an image and update product successfully', async () => {
      // Arrange
      const productId = 1;
      const cloudinaryResult = createMockCloudinaryUploadResult();

      // Create a simple response DTO
      const responseDto = new ProductResponseDto();
      Object.assign(responseDto, {
        id: productId,
        imageUrl: cloudinaryResult.secure_url,
      });

      // Setup the mock to return our response
      jest
        .spyOn(cloudinaryImageService, 'uploadEntityImage')
        .mockResolvedValue(responseDto);

      // Act
      const result = await useCase.execute(productId, mockBuffer);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(cloudinaryImageService.uploadEntityImage).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: productId,
          repository: mockProductsRepository,
          imageBuffer: mockBuffer,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          imageUrl: cloudinaryResult.secure_url,
        }),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 999;

      // Setup mock to throw error that will be caught and converted to NotFoundException
      jest
        .spyOn(cloudinaryImageService, 'uploadEntityImage')
        .mockImplementation(() => {
          throw new Error('Entity with ID 999 not found');
        });

      // Act & Assert
      await expect(useCase.execute(productId, mockBuffer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate other errors', async () => {
      // Arrange
      const productId = 1;
      const testError = new Error('Test error');

      // Setup mock to throw a generic error
      jest
        .spyOn(cloudinaryImageService, 'uploadEntityImage')
        .mockImplementation(() => {
          throw testError;
        });

      // Act & Assert
      await expect(useCase.execute(productId, mockBuffer)).rejects.toThrow(
        testError,
      );
    });
  });
});
