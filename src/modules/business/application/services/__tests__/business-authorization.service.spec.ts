import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BusinessAuthorizationService } from '../business-authorization.service';
import { UsersRepository } from '../../../../users/infrastructure/repositories/users.repository';
import { Role, Provider } from '@prisma/client';
import { AuthUser } from '../../../../auth/domain/interfaces/user.interface';

describe('BusinessAuthorizationService', () => {
  let service: BusinessAuthorizationService;
  let usersRepository: UsersRepository;

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

  const mockUserWithBusiness = {
    id: 2,
    email: 'business@example.com',
    name: 'Business User',
    role: Role.BUSINESS,
    provider: Provider.LOCAL,
    businessId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutBusiness = {
    id: 2,
    email: 'business@example.com',
    name: 'Business User',
    role: Role.BUSINESS,
    provider: Provider.LOCAL,
    businessId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessAuthorizationService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessAuthorizationService>(
      BusinessAuthorizationService,
    );
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyBusinessAccess', () => {
    it('should allow SUPER_ADMIN to access any business', async () => {
      await expect(
        service.verifyBusinessAccess(mockSuperAdmin, 1, 'update'),
      ).resolves.not.toThrow();
    });

    it('should allow BUSINESS user to access their own business', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockResolvedValue(mockUserWithBusiness);

      await expect(
        service.verifyBusinessAccess(mockBusinessUser, 1, 'update'),
      ).resolves.not.toThrow();
    });

    it('should prevent BUSINESS user from accessing other businesses', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockResolvedValue(mockUserWithBusiness);

      await expect(
        service.verifyBusinessAccess(mockBusinessUser, 999, 'update'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent BUSINESS user without a business from accessing any business', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockResolvedValue(mockUserWithoutBusiness);

      await expect(
        service.verifyBusinessAccess(mockBusinessUser, 1, 'update'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(null);

      await expect(
        service.verifyBusinessAccess(mockBusinessUser, 1, 'update'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include the action in the error message', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockResolvedValue(mockUserWithBusiness);

      await expect(
        service.verifyBusinessAccess(
          mockBusinessUser,
          999,
          'update the logo of',
        ),
      ).rejects.toThrow('You can only update the logo of your own business');
    });
  });
});
