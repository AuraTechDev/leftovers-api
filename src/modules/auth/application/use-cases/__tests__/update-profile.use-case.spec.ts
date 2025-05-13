/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from '../update-profile.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Provider, Role } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { UpdateProfileDto } from '../../../infrastructure/dto/update-profile.dto';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findUserByEmail: jest.fn(),
      updateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProfileUseCase>(UpdateProfileUseCase);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update profile successfully', async () => {
      // Arrange
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        photoUrl: 'https://new-photo.url',
      };

      const user = {
        id: userId,
        name: 'Original Name',
        email: 'test@example.com',
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...user,
        name: updateProfileDto.name as string,
        photoUrl: updateProfileDto.photoUrl ?? null,
      };

      authRepository.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(userId, updateProfileDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual(userId);
      expect(result.name).toEqual(updateProfileDto.name);
      expect(result.photoUrl).toEqual(updateProfileDto.photoUrl);

      expect(authRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      );
    });

    it('should update email if not conflicting with existing user', async () => {
      // Arrange
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = {
        email: 'newemail@example.com',
      };

      const user = {
        id: userId,
        name: 'Test User',
        email: 'original@example.com',
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...user,
        email: updateProfileDto.email as string,
      };

      authRepository.findUserByEmail.mockResolvedValue(null);
      authRepository.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(userId, updateProfileDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toEqual(updateProfileDto.email);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        updateProfileDto.email,
      );
      expect(authRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      );
    });

    it('should throw ConflictException if email already in use by another user', async () => {
      // Arrange
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = {
        email: 'existing@example.com',
      };

      const existingUser = {
        id: 2, // Different user
        name: 'Another User',
        email: updateProfileDto.email as string,
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(userId, updateProfileDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        updateProfileDto.email,
      );
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should allow updating to current user email', async () => {
      // Arrange
      const userId = 1;
      const updateProfileDto: UpdateProfileDto = {
        email: 'current@example.com',
        name: 'Updated Name',
      };

      const currentUser = {
        id: userId,
        name: 'Current User',
        email: updateProfileDto.email as string, // Same email
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...currentUser,
        name: updateProfileDto.name as string,
      };

      authRepository.findUserByEmail.mockResolvedValue(currentUser);
      authRepository.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(userId, updateProfileDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toEqual(updateProfileDto.name);
      expect(result.email).toEqual(updateProfileDto.email);

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        updateProfileDto.email,
      );
      expect(authRepository.updateUser).toHaveBeenCalledWith(
        userId,
        updateProfileDto,
      );
    });
  });
});
