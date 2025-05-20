import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateBusinessUseCase } from '../update-business.use-case';
import { BusinessRepository } from '../../../infrastructure/repositories/business.repository';
import { UpdateBusinessDto } from '../../dtos/update-business.dto';
import { BusinessAuthorizationService } from '../../services/business-authorization.service';
import { Role, Provider } from '@prisma/client';
import { AuthUser } from '../../../../auth/domain/interfaces/user.interface';

describe('UpdateBusinessUseCase', () => {
  let useCase: UpdateBusinessUseCase;
  let businessRepository: BusinessRepository;
  let businessAuthorizationService: BusinessAuthorizationService;

  const mockBusiness = {
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
  };

  const mockBusinessUser: AuthUser = {
    id: 2,
    email: 'business@example.com',
    name: 'Business User',
    role: Role.BUSINESS,
    provider: Provider.LOCAL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBusinessUseCase,
        {
          provide: BusinessRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
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

    useCase = module.get<UpdateBusinessUseCase>(UpdateBusinessUseCase);
    businessRepository = module.get<BusinessRepository>(BusinessRepository);
    businessAuthorizationService = module.get<BusinessAuthorizationService>(
      BusinessAuthorizationService,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a business', async () => {
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Updated Business',
      description: 'Updated Description',
    };

    const updatedBusiness = {
      ...mockBusiness,
      name: updateBusinessDto.name!,
      description: updateBusinessDto.description!,
    };

    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');
    const verifyAccessSpy = jest.spyOn(
      businessAuthorizationService,
      'verifyBusinessAccess',
    );

    findByIdSpy.mockResolvedValue(mockBusiness);
    updateSpy.mockResolvedValue(updatedBusiness);
    verifyAccessSpy.mockResolvedValue(undefined);

    const result = await useCase.execute(1, updateBusinessDto, mockSuperAdmin);

    expect(verifyAccessSpy).toHaveBeenCalledWith(mockSuperAdmin, 1, 'update');
    expect(findByIdSpy).toHaveBeenCalledWith(1);
    expect(updateSpy).toHaveBeenCalledWith(1, {
      ...mockBusiness,
      ...updateBusinessDto,
    });
    expect(result).toEqual(updatedBusiness);
  });

  it('should throw NotFoundException when business not found', async () => {
    const updateBusinessDto: UpdateBusinessDto = {
      name: 'Updated Business',
    };

    const findByIdSpy = jest.spyOn(businessRepository, 'findById');
    const updateSpy = jest.spyOn(businessRepository, 'update');
    const verifyAccessSpy = jest.spyOn(
      businessAuthorizationService,
      'verifyBusinessAccess',
    );

    findByIdSpy.mockResolvedValue(null);
    verifyAccessSpy.mockResolvedValue(undefined);

    await expect(
      useCase.execute(999, updateBusinessDto, mockSuperAdmin),
    ).rejects.toThrow(NotFoundException);

    expect(verifyAccessSpy).toHaveBeenCalledWith(mockSuperAdmin, 999, 'update');
    expect(findByIdSpy).toHaveBeenCalledWith(999);
    expect(updateSpy).not.toHaveBeenCalled();
  });
});
