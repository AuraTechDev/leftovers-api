import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BusinessController } from '../business.controller';
import { CreateBusinessDto } from '../../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../../application/dtos/update-business.dto';
import { CreateBusinessUseCase } from '../../../application/use-cases/create-business.use-case';
import { GetAllBusinessesUseCase } from '../../../application/use-cases/get-all-businesses.use-case';
import { GetBusinessUseCase } from '../../../application/use-cases/get-business.use-case';
import { UpdateBusinessUseCase } from '../../../application/use-cases/update-business.use-case';
import { DeleteBusinessUseCase } from '../../../application/use-cases/delete-business.use-case';
import { UploadBusinessLogoUseCase } from '../../../application/use-cases/upload-business-logo.use-case';
import { UploadBusinessBannerUseCase } from '../../../application/use-cases/upload-business-banner.use-case';
import { UsersRepository } from '../../../../users/infrastructure/repositories/users.repository';
import {
  RequestWithUser,
  UploadedFileType,
} from '../../../__mocks__/interfaces';
import {
  mockBusiness,
  mockBusinessResponse,
  mockBusinessUser,
  mockFile,
  mockSuperAdmin,
} from '../../../__mocks__/business.mocks';
import { Business } from '../../../domain/entities/business.entity';

describe('BusinessController', () => {
  let controller: BusinessController;
  let createBusinessUseCase: CreateBusinessUseCase;
  let getAllBusinessesUseCase: GetAllBusinessesUseCase;
  let getBusinessUseCase: GetBusinessUseCase;
  let updateBusinessUseCase: UpdateBusinessUseCase;
  let deleteBusinessUseCase: DeleteBusinessUseCase;
  let uploadBusinessLogoUseCase: UploadBusinessLogoUseCase;
  let uploadBusinessBannerUseCase: UploadBusinessBannerUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        {
          provide: CreateBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAllBusinessesUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteBusinessUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UploadBusinessLogoUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UploadBusinessBannerUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
    createBusinessUseCase = module.get<CreateBusinessUseCase>(
      CreateBusinessUseCase,
    );
    getAllBusinessesUseCase = module.get<GetAllBusinessesUseCase>(
      GetAllBusinessesUseCase,
    );
    getBusinessUseCase = module.get<GetBusinessUseCase>(GetBusinessUseCase);
    updateBusinessUseCase = module.get<UpdateBusinessUseCase>(
      UpdateBusinessUseCase,
    );
    deleteBusinessUseCase = module.get<DeleteBusinessUseCase>(
      DeleteBusinessUseCase,
    );
    uploadBusinessLogoUseCase = module.get<UploadBusinessLogoUseCase>(
      UploadBusinessLogoUseCase,
    );
    uploadBusinessBannerUseCase = module.get<UploadBusinessBannerUseCase>(
      UploadBusinessBannerUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createBusiness', () => {
    it('should create a new business', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'New Business',
        address: '123 New St',
        latitude: 40.7128,
        longitude: -74.006,
        contactEmail: 'new@example.com',
      };

      const executeSpy = jest.spyOn(createBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusiness);

      const result = await controller.createBusiness(createBusinessDto);

      expect(executeSpy).toHaveBeenCalledWith(createBusinessDto);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('getAllBusinesses', () => {
    it('should return all businesses', async () => {
      const executeSpy = jest.spyOn(getAllBusinessesUseCase, 'execute');
      executeSpy.mockResolvedValue([mockBusiness]);

      const result = await controller.getAllBusinesses();

      expect(executeSpy).toHaveBeenCalled();
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('getBusinessById', () => {
    it('should return a business by id', async () => {
      const executeSpy = jest.spyOn(getBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusiness);

      const result = await controller.getBusinessById(1);

      expect(executeSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException when business is not found', async () => {
      const executeSpy = jest.spyOn(getBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(null as unknown as Business);

      await expect(controller.getBusinessById(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(executeSpy).toHaveBeenCalledWith(999);
    });
  });

  describe('updateBusiness', () => {
    it('should allow SUPER_ADMIN to update any business', async () => {
      // Arrange
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const req = { user: mockSuperAdmin } as RequestWithUser;
      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.updateBusiness(
        1,
        updateBusinessDto,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, updateBusinessDto, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should allow BUSINESS user to update their own business', async () => {
      // Arrange
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.updateBusiness(
        1,
        updateBusinessDto,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, updateBusinessDto, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should prevent BUSINESS user from updating other businesses', async () => {
      // Arrange
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockRejectedValue(new ForbiddenException('Access denied'));

      // Act & Assert
      await expect(
        controller.updateBusiness(999, updateBusinessDto, req.user),
      ).rejects.toThrow(ForbiddenException);
      expect(executeSpy).toHaveBeenCalledWith(999, updateBusinessDto, req.user);
    });

    it('should prevent BUSINESS user without a business from updating any business', async () => {
      // Arrange
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const req = {
        user: { ...mockBusinessUser, businessId: null },
      } as unknown as RequestWithUser;
      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockRejectedValue(new ForbiddenException('Access denied'));

      // Act & Assert
      await expect(
        controller.updateBusiness(1, updateBusinessDto, req.user),
      ).rejects.toThrow(ForbiddenException);
      expect(executeSpy).toHaveBeenCalledWith(1, updateBusinessDto, req.user);
    });

    it('should handle user not found', async () => {
      // Arrange
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(updateBusinessUseCase, 'execute');
      executeSpy.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(
        controller.updateBusiness(1, updateBusinessDto, req.user),
      ).rejects.toThrow(NotFoundException);
      expect(executeSpy).toHaveBeenCalledWith(1, updateBusinessDto, req.user);
    });
  });

  describe('deleteBusiness', () => {
    it('should delete a business', async () => {
      const executeSpy = jest.spyOn(deleteBusinessUseCase, 'execute');
      executeSpy.mockResolvedValue(undefined);

      await controller.deleteBusiness(1);

      expect(executeSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('uploadLogo', () => {
    it('should upload a logo as a SUPER_ADMIN', async () => {
      // Arrange
      const req = { user: mockSuperAdmin } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessLogoUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.uploadLogo(
        1,
        mockFile as UploadedFileType,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should upload a logo as a BUSINESS user for their own business', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessLogoUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.uploadLogo(
        1,
        mockFile as UploadedFileType,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should throw ForbiddenException when BUSINESS user tries to upload for another business', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessLogoUseCase, 'execute');
      executeSpy.mockRejectedValue(new ForbiddenException('Access denied'));

      // Act & Assert
      await expect(
        controller.uploadLogo(2, mockFile as UploadedFileType, req.user),
      ).rejects.toThrow(ForbiddenException);
      expect(executeSpy).toHaveBeenCalledWith(2, mockFile.buffer, req.user);
    });

    it('should handle user not found', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessLogoUseCase, 'execute');
      executeSpy.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(
        controller.uploadLogo(1, mockFile as UploadedFileType, req.user),
      ).rejects.toThrow(NotFoundException);
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
    });

    it('should throw NotFoundException when no file is uploaded', async () => {
      // Arrange
      const req = { user: mockSuperAdmin } as unknown as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessLogoUseCase, 'execute');

      // Act & Assert
      await expect(
        controller.uploadLogo(1, null as unknown as UploadedFileType, req.user),
      ).rejects.toThrow(NotFoundException);
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });

  describe('uploadBanner', () => {
    it('should upload a banner as a SUPER_ADMIN', async () => {
      // Arrange
      const req = { user: mockSuperAdmin } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessBannerUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.uploadBanner(
        1,
        mockFile as UploadedFileType,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should upload a banner as a BUSINESS user for their own business', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessBannerUseCase, 'execute');
      executeSpy.mockResolvedValue(mockBusinessResponse);

      // Act
      const result = await controller.uploadBanner(
        1,
        mockFile as UploadedFileType,
        req.user,
      );

      // Assert
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
      expect(result).toEqual(mockBusinessResponse);
    });

    it('should throw ForbiddenException when BUSINESS user tries to upload banner for another business', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessBannerUseCase, 'execute');
      executeSpy.mockRejectedValue(new ForbiddenException('Access denied'));

      // Act & Assert
      await expect(
        controller.uploadBanner(2, mockFile as UploadedFileType, req.user),
      ).rejects.toThrow(ForbiddenException);
      expect(executeSpy).toHaveBeenCalledWith(2, mockFile.buffer, req.user);
    });

    it('should handle user not found', async () => {
      // Arrange
      const req = { user: mockBusinessUser } as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessBannerUseCase, 'execute');
      executeSpy.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(
        controller.uploadBanner(1, mockFile as UploadedFileType, req.user),
      ).rejects.toThrow(NotFoundException);
      expect(executeSpy).toHaveBeenCalledWith(1, mockFile.buffer, req.user);
    });

    it('should throw NotFoundException when no file is uploaded', async () => {
      // Arrange
      const req = { user: mockSuperAdmin } as unknown as RequestWithUser;
      const executeSpy = jest.spyOn(uploadBusinessBannerUseCase, 'execute');

      // Act & Assert
      await expect(
        controller.uploadBanner(
          1,
          null as unknown as UploadedFileType,
          req.user,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(executeSpy).not.toHaveBeenCalled();
    });
  });
});
