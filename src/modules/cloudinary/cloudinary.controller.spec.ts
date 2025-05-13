import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryController } from './cloudinary.controller';
import { CloudinaryService } from './cloudinary.service';
import { BadRequestException } from '@nestjs/common';

// Mock environment configuration
jest.mock('../../config/env.config', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret',
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
  },
}));

// Add MulterFile interface to match the controller
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

// Mock the CloudinaryService
const mockCloudinaryService = {
  uploadImage: jest.fn(),
};

describe('CloudinaryController', () => {
  let controller: CloudinaryController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudinaryController],
      providers: [
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    controller = module.get<CloudinaryController>(CloudinaryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should successfully upload an image and return data', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image data'),
        size: 1234,
      };

      mockCloudinaryService.uploadImage.mockResolvedValueOnce({
        public_id: 'folder/test-id',
        secure_url: 'https://example.com/test-id.jpg',
      });

      const result = await controller.uploadImage(mockFile, 'test-folder');

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(
        mockFile.buffer,
        'test-folder',
      );
      expect(result).toEqual({
        publicId: 'folder/test-id',
        url: 'https://example.com/test-id.jpg',
        originalFilename: 'test-image.jpg',
      });
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(
        controller.uploadImage(null as unknown as MulterFile, 'test-folder'),
      ).rejects.toThrow(BadRequestException);
      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should handle errors from CloudinaryService', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image data'),
        size: 1234,
      };

      mockCloudinaryService.uploadImage.mockRejectedValueOnce(
        new Error('Upload failed'),
      );

      await expect(controller.uploadImage(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockCloudinaryService.uploadImage).toHaveBeenCalled();
    });
  });
});
