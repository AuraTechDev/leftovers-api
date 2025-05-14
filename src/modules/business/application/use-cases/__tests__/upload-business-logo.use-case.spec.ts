import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadBusinessLogoUseCase } from '../upload-business-logo.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { CloudinaryImageService } from '../../../../cloudinary/cloudinary-image.service';
import { CLOUDINARY_FOLDERS } from '../../../../cloudinary/constants/cloudinary-folders';
import { mockCloudinaryUploadResult } from '../../../__mocks__/business.mocks';
import { BusinessResponseDto } from '../../dtos/business-response.dto';

describe('UploadBusinessLogoUseCase', () => {
  let useCase: UploadBusinessLogoUseCase;
  let businessRepository: BusinessRepository;
  let cloudinaryImageService: CloudinaryImageService;

  const mockBuffer = Buffer.from('test-image');

  beforeEach(async () => {
    const mockBusinessRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockCloudinaryService = {
      uploadEntityImage: jest.fn(),
      extractPublicId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadBusinessLogoUseCase,
        {
          provide: BusinessRepository,
          useValue: mockBusinessRepo,
        },
        {
          provide: CloudinaryImageService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    useCase = module.get<UploadBusinessLogoUseCase>(UploadBusinessLogoUseCase);
    businessRepository = module.get(BusinessRepository);
    cloudinaryImageService = module.get(CloudinaryImageService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should upload a new logo and update business', async () => {
    // Arrange
    // Create a simple response DTO
    const responseDto = new BusinessResponseDto();
    Object.assign(responseDto, {
      id: 1,
      name: 'Test Business',
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });

    // Setup the mock to return our response
    jest
      .spyOn(cloudinaryImageService, 'uploadEntityImage')
      .mockResolvedValue(responseDto);

    // Act
    const result = await useCase.execute(1, mockBuffer);

    // Assert
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cloudinaryImageService.uploadEntityImage).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 1,
        repository: businessRepository,
        imageBuffer: mockBuffer,
        cloudinaryFolder: CLOUDINARY_FOLDERS.BUSINESS_LOGOS,
      }),
    );
    expect(result.logoUrl).toEqual(mockCloudinaryUploadResult.secure_url);
  });

  it('should throw NotFoundException when business not found', async () => {
    // Arrange
    // Setup mock to throw error that will be caught and converted to NotFoundException
    jest
      .spyOn(cloudinaryImageService, 'uploadEntityImage')
      .mockImplementation(() => {
        throw new Error('Entity with ID 999 not found');
      });

    // Act & Assert
    await expect(useCase.execute(999, mockBuffer)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should pass through other errors', async () => {
    // Arrange
    const testError = new Error('Test error');

    // Setup mock to throw a generic error
    jest
      .spyOn(cloudinaryImageService, 'uploadEntityImage')
      .mockImplementation(() => {
        throw testError;
      });

    // Act & Assert
    await expect(useCase.execute(1, mockBuffer)).rejects.toThrow(testError);
  });
});
