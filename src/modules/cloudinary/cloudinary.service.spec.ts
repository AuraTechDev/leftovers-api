/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

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

// Mock Cloudinary
jest.mock('cloudinary', () => {
  return {
    v2: {
      config: jest.fn(),
      uploader: {
        upload_stream: jest.fn().mockImplementation((options, callback) => {
          const uploadStream = {
            write: jest.fn(),
            end: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
            emit: jest.fn(),
          };

          // Schedule the callback to be called asynchronously
          process.nextTick(() => {
            callback(null, {
              public_id: 'test-id',
              secure_url:
                'https://res.cloudinary.com/test/image/upload/test-id',
              url: 'http://res.cloudinary.com/test/image/upload/test-id',
            });
          });

          return uploadStream;
        }),
        upload: jest.fn().mockImplementation((path, options, callback) => {
          if (typeof callback === 'function') {
            callback(null, {
              public_id: 'test-id',
              secure_url:
                'https://res.cloudinary.com/test/image/upload/test-id',
              url: 'http://res.cloudinary.com/test/image/upload/test-id',
            });
          } else {
            return Promise.resolve({
              public_id: 'test-id',
              secure_url:
                'https://res.cloudinary.com/test/image/upload/test-id',
              url: 'http://res.cloudinary.com/test/image/upload/test-id',
            });
          }
        }),
        destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
      },
    },
  };
});

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    // Run onModuleInit manually
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure Cloudinary on initialization', () => {
    expect(cloudinary.config).toHaveBeenCalled();
  });

  describe('uploadImage', () => {
    it('should upload a buffer correctly', async () => {
      // Use a type for the callback
      let storedCallback: (error: Error | null, result: any) => void;
      // Create a custom mock implementation for this test
      const mockUploadStream = {
        end: jest.fn().mockImplementation(() => {
          // Simulate successful upload
          process.nextTick(() => {
            const result = {
              public_id: 'test-id',
              secure_url:
                'https://res.cloudinary.com/test/image/upload/test-id',
              url: 'http://res.cloudinary.com/test/image/upload/test-id',
            };
            // Call the stored callback
            if (storedCallback) storedCallback(null, result);
          });
        }),
      };

      // Use a specific mock implementation just for this test
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          storedCallback = callback;
          return mockUploadStream;
        },
      );

      const mockBuffer = Buffer.from('test image');
      const result = await service.uploadImage(mockBuffer);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
      expect(result).toHaveProperty('public_id', 'test-id');
      expect(result).toHaveProperty('secure_url');
    });

    it('should upload a buffer with folder option', async () => {
      // Use a type for the callback
      let storedCallback: (error: Error | null, result: any) => void;
      // Create a custom mock implementation for this test
      const mockUploadStream = {
        end: jest.fn().mockImplementation(() => {
          // Simulate successful upload
          process.nextTick(() => {
            const result = {
              public_id: 'test-id',
              secure_url:
                'https://res.cloudinary.com/test/image/upload/test-id',
              url: 'http://res.cloudinary.com/test/image/upload/test-id',
            };
            // Call the stored callback
            if (storedCallback) storedCallback(null, result);
          });
        }),
      };

      // Use a specific mock implementation just for this test
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
        (options, callback) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          storedCallback = callback;
          return mockUploadStream;
        },
      );

      const mockBuffer = Buffer.from('test image');
      const result = await service.uploadImage(mockBuffer, 'test-folder');

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'test-folder' }),
        expect.any(Function),
      );
      expect(result).toHaveProperty('public_id', 'test-id');
    });

    it('should upload a file path correctly', async () => {
      // Create a mock for the cloudinary.uploader.upload function
      const mockResult = {
        public_id: 'test-id',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-id',
        url: 'http://res.cloudinary.com/test/image/upload/test-id',
      };

      // Set up the mock to return our expected result
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValueOnce(
        mockResult,
      );

      const mockPath = '/path/to/image.jpg';
      const result = await service.uploadImage(mockPath);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockPath,
        expect.any(Object),
      );
      expect(result).toHaveProperty('public_id', 'test-id');
    });

    it('should handle upload errors with buffer', async () => {
      // Cast to any to avoid TypeScript type checking issues in tests
      const originalImplementation = cloudinary.uploader.upload_stream;
      (cloudinary.uploader.upload_stream as any) = jest
        .fn()
        .mockImplementationOnce((options, callback) => {
          setTimeout(() => {
            callback(new Error('Upload failed'), null);
          }, 10);
          return { end: jest.fn() };
        });

      const mockBuffer = Buffer.from('test image');

      await expect(service.uploadImage(mockBuffer)).rejects.toThrow(
        'Error uploading image',
      );

      // Restore the original mock implementation
      cloudinary.uploader.upload_stream = originalImplementation;
    });
  });

  describe('deleteImage', () => {
    it('should delete an image correctly', async () => {
      // Create a mock result for the destroy method
      const mockResult = { result: 'ok' };

      // Set up the mock to return our expected result
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValueOnce(
        mockResult,
      );

      const result = await service.deleteImage('test-id');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test-id');
      expect(result).toHaveProperty('result', 'ok');
    });

    it('should handle delete errors', async () => {
      // Override implementation for this test
      jest
        .spyOn(cloudinary.uploader, 'destroy')
        .mockRejectedValueOnce(new Error('Delete failed'));

      await expect(service.deleteImage('test-id')).rejects.toThrow(
        'Error deleting image',
      );
    });
  });
});
