import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '../services/cloudinary.service';

// Mock cloudinary before import
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ public_id: 'test-id' }),
      upload_stream: jest.fn().mockReturnValue({
        end: jest.fn(),
        pipe: jest.fn(),
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
    url: jest.fn().mockReturnValue('https://example.com/test-id'),
    api: {
      resources: jest.fn().mockResolvedValue({ resources: [] }),
      create_folder: jest.fn().mockResolvedValue({ success: true }),
    },
    utils: {
      api_sign_request: jest.fn().mockReturnValue('test-signature'),
    },
  },
}));

// Mock environment configuration
jest.mock('../../../../config/env.config', () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: 'test-cloud',
    CLOUDINARY_API_KEY: 'test-key',
    CLOUDINARY_API_SECRET: 'test-secret',
  },
}));

// Import after mocks are set up
import { v2 as cloudinary } from 'cloudinary';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should configure Cloudinary on initialization', () => {
    expect(cloudinary.config).toHaveBeenCalled();
  });

  // Basic file path test
  it('should upload a file path', async () => {
    await service.uploadImage('test.jpg');
    expect(cloudinary.uploader.upload).toHaveBeenCalled();
  });

  // Test delete functionality
  it('should delete images', async () => {
    await service.deleteImage('test-id');
    expect(cloudinary.uploader.destroy).toHaveBeenCalled();
  });

  // Test URL transformation
  it('should transform URLs', () => {
    service.getTransformedUrl('test-id', 'w_100,h_100');
    expect(cloudinary.url).toHaveBeenCalled();
  });

  // Test listing resources
  it('should list resources', async () => {
    await service.listResources('test-folder');
    expect(cloudinary.api.resources).toHaveBeenCalled();
  });

  // Test folder creation
  it('should create folders', async () => {
    await service.createFolder('test-folder');
    expect(cloudinary.api.create_folder).toHaveBeenCalled();
  });

  // Test signed upload params
  it('should generate signed upload params', () => {
    service.getSignedUploadParams('test-preset');
    expect(cloudinary.utils.api_sign_request).toHaveBeenCalled();
  });
});
