import { Test, TestingModule } from '@nestjs/testing';
import {
  CloudinaryImageService,
  EntityRepository,
} from '../cloudinary-image.service';
import { CloudinaryService } from '../cloudinary.service';
import { Logger } from '@nestjs/common';

// Mock entity for testing
interface TestEntity {
  id: number;
  imageUrl: string;
  name: string;
}

// Mock environment configuration
jest.mock('../../../config/env.config', () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
  },
}));

// Mock repository implementation
class MockEntityRepository implements EntityRepository<TestEntity> {
  private entities: TestEntity[] = [
    {
      id: 1,
      imageUrl:
        'https://res.cloudinary.com/demo/image/upload/v1234/old_public_id.jpg',
      name: 'Test Entity',
    },
    {
      id: 2,
      imageUrl: '',
      name: 'Entity Without Image',
    },
  ];

  findById(id: number): Promise<TestEntity | null> {
    const entity = this.entities.find((e) => e.id === id);
    return Promise.resolve(entity || null);
  }

  update(id: number, data: Partial<TestEntity>): Promise<TestEntity> {
    const index = this.entities.findIndex((e) => e.id === id);
    if (index === -1) {
      return Promise.reject(new Error(`Entity with ID ${id} not found`));
    }

    const updatedEntity = {
      ...this.entities[index],
      ...data,
    };

    this.entities[index] = updatedEntity;
    return Promise.resolve(updatedEntity);
  }
}

// Mock CloudinaryService
const mockCloudinaryService = {
  uploadImage: jest.fn(),
  deleteImage: jest.fn(),
};

describe('CloudinaryImageService', () => {
  let service: CloudinaryImageService;
  let repository: MockEntityRepository;

  beforeEach(async () => {
    repository = new MockEntityRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryImageService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryImageService>(CloudinaryImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractPublicId', () => {
    it('should extract public ID from Cloudinary URL', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v1234/test_public_id.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBe('test_public_id');
    });

    it('should handle URLs without version number', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/test_public_id.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBe('test_public_id');
    });

    it('should return null for invalid URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const result = service.extractPublicId(null as unknown as string);
      expect(result).toBeNull();
    });
  });

  describe('uploadEntityImage', () => {
    it('should upload image for entity with existing image', async () => {
      // Arrange
      const entityId = 1;
      const imageBuffer = Buffer.from('test image data');
      const cloudinaryFolder = 'test-folder';
      const uploadResult = {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(uploadResult);
      mockCloudinaryService.deleteImage.mockResolvedValue({ result: 'ok' });

      const responseTransformer = (entity: TestEntity) => ({
        id: entity.id,
        image: entity.imageUrl,
        name: entity.name,
      });

      // Act
      const result = await service.uploadEntityImage({
        entityId,
        repository,
        imageBuffer,
        cloudinaryFolder,
        imageField: 'imageUrl',
        responseTransformer,
      });

      // Assert
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        imageBuffer,
        cloudinaryFolder,
      );

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(
        'old_public_id',
      );

      expect(result).toEqual({
        id: 1,
        image:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
        name: 'Test Entity',
      });
    });

    it('should upload image for entity without existing image', async () => {
      // Arrange
      const entityId = 2;
      const imageBuffer = Buffer.from('test image data');
      const cloudinaryFolder = 'test-folder';
      const uploadResult = {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(uploadResult);

      const responseTransformer = (entity: TestEntity) => ({
        id: entity.id,
        image: entity.imageUrl,
        name: entity.name,
      });

      // Act
      const result = await service.uploadEntityImage({
        entityId,
        repository,
        imageBuffer,
        cloudinaryFolder,
        imageField: 'imageUrl',
        responseTransformer,
      });

      // Assert
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        imageBuffer,
        cloudinaryFolder,
      );

      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: 2,
        image:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
        name: 'Entity Without Image',
      });
    });

    it('should throw error if entity not found', async () => {
      // Arrange
      const entityId = 999;
      const imageBuffer = Buffer.from('test image data');
      const cloudinaryFolder = 'test-folder';

      const responseTransformer = (entity: TestEntity) => entity;

      // Act & Assert
      await expect(
        service.uploadEntityImage({
          entityId,
          repository,
          imageBuffer,
          cloudinaryFolder,
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Entity with ID 999 not found');

      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(mockCloudinaryService.deleteImage).not.toHaveBeenCalled();
    });

    it('should handle errors during old image deletion', async () => {
      // Arrange
      const entityId = 1;
      const imageBuffer = Buffer.from('test image data');
      const cloudinaryFolder = 'test-folder';
      const uploadResult = {
        secure_url:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
      };

      mockCloudinaryService.uploadImage.mockResolvedValue(uploadResult);
      mockCloudinaryService.deleteImage.mockRejectedValue(
        new Error('Delete failed'),
      );

      const responseTransformer = (entity: TestEntity) => entity;

      // Act
      const result = await service.uploadEntityImage({
        entityId,
        repository,
        imageBuffer,
        cloudinaryFolder,
        imageField: 'imageUrl',
        responseTransformer,
      });

      // Assert
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        imageBuffer,
        cloudinaryFolder,
      );

      expect(mockCloudinaryService.deleteImage).toHaveBeenCalledWith(
        'old_public_id',
      );

      // Process should continue despite error in deletion
      expect(result).toEqual({
        id: 1,
        imageUrl:
          'https://res.cloudinary.com/demo/image/upload/v1234/new_public_id.jpg',
        name: 'Test Entity',
      });
    });
  });
});
