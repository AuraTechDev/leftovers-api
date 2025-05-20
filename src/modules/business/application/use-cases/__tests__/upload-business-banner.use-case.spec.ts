import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadBusinessBannerUseCase } from '../upload-business-banner.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { CloudinaryImageService } from '../../../../cloudinary/cloudinary-image.service';
import { CLOUDINARY_FOLDERS } from '../../../../cloudinary/constants/cloudinary-folders';
import { mockCloudinaryUploadResult } from '../../../__mocks__/business.mocks';
import { BusinessResponseDto } from '../../dtos/business-response.dto';
import { Business } from '../../../domain/entities/business.entity';
import { BusinessAuthorizationService } from '../../services/business-authorization.service';
import { Role, Provider } from '@prisma/client';
import { AuthUser } from '../../../../auth/domain/interfaces/user.interface';

describe('UploadBusinessBannerUseCase', () => {
  let useCase: UploadBusinessBannerUseCase;
  let businessRepository: BusinessRepository;
  let cloudinaryImageService: CloudinaryImageService;
  let businessAuthorizationService: BusinessAuthorizationService;

  const mockBuffer = Buffer.from('test-image-data');
  const mockCloudinaryUploadResult = {
    secure_url: 'https://cloudinary.com/test-image.jpg',
  };

  const mockSuperAdmin: AuthUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.SUPER_ADMIN,
    provider: Provider.LOCAL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadBusinessBannerUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: CloudinaryImageService,
          useValue: {
            uploadEntityImage: jest.fn(),
          },
        },
        {
          provide: BusinessAuthorizationService,
          useValue: {
            verifyBusinessAccess: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UploadBusinessBannerUseCase>(
      UploadBusinessBannerUseCase,
    );
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
    cloudinaryImageService = module.get<CloudinaryImageService>(
      CloudinaryImageService,
    );
    businessAuthorizationService = module.get<BusinessAuthorizationService>(
      BusinessAuthorizationService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should upload a new banner and update business', async () => {
    // Create a simple response DTO
    const responseDto = new BusinessResponseDto();
    Object.assign(responseDto, {
      id: 1,
      name: 'Test Business',
      bannerUrl: mockCloudinaryUploadResult.secure_url,
    });

    // Setup the mock to return our response
    jest
      .spyOn(cloudinaryImageService, 'uploadEntityImage')
      .mockResolvedValue(responseDto);

    const verifyAccessSpy = jest.spyOn(
      businessAuthorizationService,
      'verifyBusinessAccess',
    );
    verifyAccessSpy.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(1, mockBuffer, mockSuperAdmin);

    // Assert
    expect(verifyAccessSpy).toHaveBeenCalledWith(
      mockSuperAdmin,
      1,
      'update the banner of',
    );
    expect(cloudinaryImageService.uploadEntityImage).toHaveBeenCalledWith(
      expect.objectContaining({
        entityId: 1,
        repository: businessRepository,
        imageBuffer: mockBuffer,
        cloudinaryFolder: CLOUDINARY_FOLDERS.BUSINESS_BANNERS,
      }),
    );
    expect(result.bannerUrl).toEqual(mockCloudinaryUploadResult.secure_url);
  });

  it('should throw NotFoundException when business not found', async () => {
    // Setup mock to throw error that will be caught and converted to NotFoundException
    jest
      .spyOn(cloudinaryImageService, 'uploadEntityImage')
      .mockImplementation(() => {
        throw new Error('Entity with ID 999 not found');
      });

    const verifyAccessSpy = jest.spyOn(
      businessAuthorizationService,
      'verifyBusinessAccess',
    );
    verifyAccessSpy.mockResolvedValue(undefined);

    // Act & Assert
    await expect(
      useCase.execute(999, mockBuffer, mockSuperAdmin),
    ).rejects.toThrow(NotFoundException);
    expect(verifyAccessSpy).toHaveBeenCalledWith(
      mockSuperAdmin,
      999,
      'update the banner of',
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

    const verifyAccessSpy = jest.spyOn(
      businessAuthorizationService,
      'verifyBusinessAccess',
    );
    verifyAccessSpy.mockResolvedValue(undefined);

    // Act & Assert
    await expect(
      useCase.execute(1, mockBuffer, mockSuperAdmin),
    ).rejects.toThrow(testError);
    expect(verifyAccessSpy).toHaveBeenCalledWith(
      mockSuperAdmin,
      1,
      'update the banner of',
    );
  });
});
