/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateOAuthUserUseCase } from '../validate-oauth-user.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Role } from '@prisma/client';
import {
  mockOAuthData,
  mockOAuthUser,
  mockOAuthExistingUser,
  mockOAuthUpdatedUser,
} from '../../../__mocks__/auth.mocks';

describe('ValidateOAuthUserUseCase', () => {
  let useCase: ValidateOAuthUserUseCase;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findUserByProviderAndProviderId: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateOAuthUserUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ValidateOAuthUserUseCase>(ValidateOAuthUserUseCase);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return existing user when found', async () => {
      // Arrange
      authRepository.findUserByProviderAndProviderId.mockResolvedValue(
        mockOAuthUser,
      );

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockOAuthUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.createUser).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should create new user when not found', async () => {
      // Arrange
      authRepository.findUserByProviderAndProviderId.mockResolvedValue(null);
      authRepository.createUser.mockResolvedValue(mockOAuthUser);

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockOAuthUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.createUser).toHaveBeenCalledWith({
        email: mockOAuthData.email,
        name: mockOAuthData.name,
        photoUrl: mockOAuthData.photoUrl,
        provider: mockOAuthData.provider,
        providerId: mockOAuthData.providerId,
        role: Role.USER,
      });
    });

    it('should update user when profile info has changed', async () => {
      // Arrange
      const existingUser = mockOAuthExistingUser;
      const updatedUser = mockOAuthUpdatedUser;

      authRepository.findUserByProviderAndProviderId.mockResolvedValue(
        existingUser,
      );
      authRepository.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.updateUser).toHaveBeenCalledWith(existingUser.id, {
        name: mockOAuthData.name,
        photoUrl: mockOAuthData.photoUrl,
      });
    });

    it('should not update user when profile info is the same', async () => {
      // Arrange
      authRepository.findUserByProviderAndProviderId.mockResolvedValue(
        mockOAuthUser,
      );

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockOAuthUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });
  });
});
