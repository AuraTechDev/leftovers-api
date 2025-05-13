/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateOAuthUserUseCase } from '../validate-oauth-user.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Provider, Role, User } from '@prisma/client';
import { OAuthLoginDto } from '../../../infrastructure/dto/oauth-login.dto';

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
    const mockOAuthData: OAuthLoginDto = {
      provider: Provider.GOOGLE,
      providerId: 'google-123',
      email: 'test@example.com',
      name: 'Test User',
      photoUrl: 'https://example.com/photo.jpg',
    };

    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: null,
      role: Role.USER,
      provider: Provider.GOOGLE,
      providerId: 'google-123',
      photoUrl: 'https://example.com/photo.jpg',
      businessId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return existing user when found', async () => {
      // Arrange
      authRepository.findUserByProviderAndProviderId.mockResolvedValue(
        mockUser,
      );

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.createUser).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should create new user when not found', async () => {
      // Arrange
      authRepository.findUserByProviderAndProviderId.mockResolvedValue(null);
      authRepository.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockUser);
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
      const existingUser = {
        ...mockUser,
        name: 'Old Name',
        photoUrl: 'https://example.com/old-photo.jpg',
      };

      const updatedUser = { ...mockUser };

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
        mockUser,
      );

      // Act
      const result = await useCase.execute(mockOAuthData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(
        authRepository.findUserByProviderAndProviderId,
      ).toHaveBeenCalledWith(mockOAuthData.provider, mockOAuthData.providerId);
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });
  });
});
