import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UploadBusinessLogoUseCase } from '../upload-business-logo.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { CloudinaryService } from '../../../../cloudinary/cloudinary.service';
import { CLOUDINARY_FOLDERS } from '../../../../cloudinary/constants/cloudinary-folders';
import {
  mockBusinessWithCloudinaryLogo,
  mockBusinessWithoutLogo,
  mockCloudinaryUploadResult,
} from '../../../__mocks__/business.mocks';

// Mock CloudinaryService
jest.mock('../../../../cloudinary/cloudinary.service', () => ({
  CloudinaryService: jest.fn().mockImplementation(() => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  })),
}));

describe('UploadBusinessLogoUseCase', () => {
  let useCase: UploadBusinessLogoUseCase;
  let businessRepository: BusinessRepository;
  let cloudinaryService: CloudinaryService;

  const mockBuffer = Buffer.from('test-image');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadBusinessLogoUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UploadBusinessLogoUseCase>(UploadBusinessLogoUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should upload a new logo and update business', async () => {
    // Arrange
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');
    const uploadImageSpy = jest.spyOn(cloudinaryService, 'uploadImage');
    const deleteImageSpy = jest.spyOn(cloudinaryService, 'deleteImage');

    findByIdSpy.mockResolvedValue(mockBusinessWithoutLogo);
    uploadImageSpy.mockImplementation(() =>
      Promise.resolve(mockCloudinaryUploadResult as any),
    );
    updateSpy.mockResolvedValue({
      ...mockBusinessWithoutLogo,
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });

    // Act
    const result = await useCase.execute(1, mockBuffer);

    // Assert
    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(uploadImageSpy).toHaveBeenCalledWith(
      mockBuffer,
      CLOUDINARY_FOLDERS.BUSINESS_LOGOS,
    );
    expect(updateSpy).toHaveBeenCalledWith(1, {
      ...mockBusinessWithoutLogo,
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });
    expect(deleteImageSpy).not.toHaveBeenCalled();
    expect(result.logoUrl).toEqual(mockCloudinaryUploadResult.secure_url);
  });

  it('should delete old logo when uploading a new one', async () => {
    // Arrange
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');
    const uploadImageSpy = jest.spyOn(cloudinaryService, 'uploadImage');
    const deleteImageSpy = jest.spyOn(cloudinaryService, 'deleteImage');

    findByIdSpy.mockResolvedValue(mockBusinessWithCloudinaryLogo);
    uploadImageSpy.mockImplementation(() =>
      Promise.resolve(mockCloudinaryUploadResult as any),
    );
    updateSpy.mockResolvedValue({
      ...mockBusinessWithCloudinaryLogo,
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });

    // Act
    const result = await useCase.execute(1, mockBuffer);

    // Assert
    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(uploadImageSpy).toHaveBeenCalledWith(
      mockBuffer,
      CLOUDINARY_FOLDERS.BUSINESS_LOGOS,
    );
    expect(updateSpy).toHaveBeenCalledWith(1, {
      ...mockBusinessWithCloudinaryLogo,
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });
    expect(deleteImageSpy).toHaveBeenCalledWith('old-logo-id');
    expect(result.logoUrl).toEqual(mockCloudinaryUploadResult.secure_url);
  });

  it('should handle error when deleting old logo', async () => {
    // Arrange
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');
    const uploadImageSpy = jest.spyOn(cloudinaryService, 'uploadImage');
    const deleteImageSpy = jest.spyOn(cloudinaryService, 'deleteImage');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    findByIdSpy.mockResolvedValue(mockBusinessWithCloudinaryLogo);
    uploadImageSpy.mockImplementation(() =>
      Promise.resolve(mockCloudinaryUploadResult as any),
    );
    updateSpy.mockResolvedValue({
      ...mockBusinessWithCloudinaryLogo,
      logoUrl: mockCloudinaryUploadResult.secure_url,
    });
    deleteImageSpy.mockRejectedValue(new Error('Delete failed'));

    // Act
    const result = await useCase.execute(1, mockBuffer);

    // Assert
    expect(deleteImageSpy).toHaveBeenCalledWith('old-logo-id');
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(result.logoUrl).toEqual(mockCloudinaryUploadResult.secure_url);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should throw NotFoundException when business not found', async () => {
    // Arrange
    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const uploadImageSpy = jest.spyOn(cloudinaryService, 'uploadImage');

    findByIdSpy.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(999, mockBuffer)).rejects.toThrow(
      NotFoundException,
    );
    expect(findByIdSpy).toHaveBeenCalledWith(999);
    expect(uploadImageSpy).not.toHaveBeenCalled();
  });
});
