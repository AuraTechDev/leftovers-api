import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { BusinessController } from '../business.controller';
import { BusinessService } from '../../services/business.service';
import { UsersService } from '../../../../users/infrastructure/services/users.service';
import { Role, Provider } from '@prisma/client';
import { CreateBusinessDto } from '../../../application/dtos/create-business.dto';
import { UpdateBusinessDto } from '../../../application/dtos/update-business.dto';
import { Business } from '../../../domain/entities/business.entity';
import { AuthUser } from '../../../../auth/domain/interfaces/user.interface';
import { User } from '../../../../users/domain/entities/user.entity';

// Create RequestWithUser interface
interface RequestWithUser extends Request {
  user: AuthUser;
}

describe('BusinessController', () => {
  let controller: BusinessController;
  let businessService: BusinessService;
  let usersService: UsersService;

  const mockBusiness: Business = {
    id: 1,
    name: 'Test Business',
    description: 'Test Description',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.006,
    contactEmail: 'business@example.com',
    phone: '555-1234',
    logoUrl: 'https://example.com/logo.png',
    openingHours: '9:00-17:00',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSuperAdmin: AuthUser = {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.SUPER_ADMIN,
    provider: Provider.LOCAL,
    businessId: 1, // Same as mockBusiness.id
  };

  const mockBusinessUser: AuthUser = {
    id: 2,
    email: 'business@example.com',
    name: 'Business User',
    role: Role.BUSINESS,
    provider: Provider.LOCAL,
    businessId: 1, // Same as mockBusiness.id
  };

  const mockUserWithBusiness: User = {
    id: '2',
    email: 'business@example.com',
    name: 'Business User',
    password: 'hashedpassword',
    businessId: 1, // Same as mockBusiness.id
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutBusiness: User = {
    id: '3',
    email: 'user@example.com',
    name: 'Regular User',
    password: 'hashedpassword',
    businessId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        {
          provide: BusinessService,
          useValue: {
            createBusiness: jest.fn(),
            getAllBusinesses: jest.fn(),
            getBusinessById: jest.fn(),
            updateBusiness: jest.fn(),
            deleteBusiness: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
    businessService = module.get<BusinessService>(BusinessService);
    usersService = module.get<UsersService>(UsersService);
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

      const createSpy = jest.spyOn(businessService, 'createBusiness');
      createSpy.mockResolvedValue(mockBusiness);

      const result = await controller.createBusiness(createBusinessDto);

      expect(createSpy).toHaveBeenCalledWith(createBusinessDto);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('getAllBusinesses', () => {
    it('should return all businesses', async () => {
      const getAllSpy = jest.spyOn(businessService, 'getAllBusinesses');
      getAllSpy.mockResolvedValue([mockBusiness]);

      const result = await controller.getAllBusinesses();

      expect(getAllSpy).toHaveBeenCalled();
      expect(result).toEqual([mockBusiness]);
    });
  });

  describe('getBusinessById', () => {
    it('should return a business by id', async () => {
      const getByIdSpy = jest.spyOn(businessService, 'getBusinessById');
      getByIdSpy.mockResolvedValue(mockBusiness);

      const result = await controller.getBusinessById(1);

      expect(getByIdSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException when business is not found', async () => {
      const getByIdSpy = jest.spyOn(businessService, 'getBusinessById');
      getByIdSpy.mockResolvedValue(null);

      await expect(controller.getBusinessById(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(getByIdSpy).toHaveBeenCalledWith(999);
    });
  });

  describe('updateBusiness', () => {
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Updated Business',
      description: 'Updated Description',
    };

    it('should allow SUPER_ADMIN to update any business', async () => {
      const req = { user: mockSuperAdmin } as unknown as RequestWithUser;

      const updateSpy = jest.spyOn(businessService, 'updateBusiness');
      updateSpy.mockResolvedValue({
        ...mockBusiness,
        name: updateBusinessDto.name!,
        description: updateBusinessDto.description!,
      });

      const result = await controller.updateBusiness(1, updateBusinessDto, req);

      expect(updateSpy).toHaveBeenCalledWith(1, updateBusinessDto);
      expect(result.name).toEqual(updateBusinessDto.name);
      expect(result.description).toEqual(updateBusinessDto.description);
    });

    it('should allow BUSINESS user to update their own business', async () => {
      const req = { user: mockBusinessUser } as unknown as RequestWithUser;

      const getUserByIdSpy = jest.spyOn(usersService, 'getUserById');
      getUserByIdSpy.mockResolvedValue(mockUserWithBusiness);

      const updateSpy = jest.spyOn(businessService, 'updateBusiness');
      updateSpy.mockResolvedValue({
        ...mockBusiness,
        name: updateBusinessDto.name!,
        description: updateBusinessDto.description!,
      });

      const result = await controller.updateBusiness(1, updateBusinessDto, req);

      expect(getUserByIdSpy).toHaveBeenCalledWith('2');
      expect(updateSpy).toHaveBeenCalledWith(1, updateBusinessDto);
      expect(result.name).toEqual(updateBusinessDto.name);
      expect(result.description).toEqual(updateBusinessDto.description);
    });

    it('should prevent BUSINESS user from updating other businesses', async () => {
      const req = { user: mockBusinessUser } as unknown as RequestWithUser;

      const getUserByIdSpy = jest.spyOn(usersService, 'getUserById');
      getUserByIdSpy.mockResolvedValue(mockUserWithBusiness);

      const updateSpy = jest.spyOn(businessService, 'updateBusiness');

      await expect(
        controller.updateBusiness(999, updateBusinessDto, req),
      ).rejects.toThrow(ForbiddenException);

      expect(getUserByIdSpy).toHaveBeenCalledWith('2');
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should prevent BUSINESS user without a business from updating any business', async () => {
      const req = {
        user: { ...mockBusinessUser, businessId: undefined },
      } as unknown as RequestWithUser;

      const getUserByIdSpy = jest.spyOn(usersService, 'getUserById');
      getUserByIdSpy.mockResolvedValue(mockUserWithoutBusiness);

      const updateSpy = jest.spyOn(businessService, 'updateBusiness');

      await expect(
        controller.updateBusiness(1, updateBusinessDto, req),
      ).rejects.toThrow(ForbiddenException);

      expect(getUserByIdSpy).toHaveBeenCalledWith('2');
      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteBusiness', () => {
    it('should delete a business', async () => {
      const deleteSpy = jest.spyOn(businessService, 'deleteBusiness');
      deleteSpy.mockResolvedValue(undefined);

      await controller.deleteBusiness(1);

      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });
});
