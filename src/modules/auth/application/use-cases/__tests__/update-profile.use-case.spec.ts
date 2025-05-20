/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileUseCase } from '../update-profile.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { ConflictException } from '@nestjs/common';
import { UpdateProfileDto } from '../../dtos/update-profile.dto';
import {
  mockUpdateProfileDto,
  mockOriginalUser,
  mockUpdatedUser,
  mockExistingUserForUpdateProfile,
  mockCurrentUser,
  mockUpdatedCurrentUser,
} from '../../../__mocks__/auth.mocks';

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
      const updateProfileDto: UpdateProfileDto = mockUpdateProfileDto;
      const updatedUser = mockUpdatedUser;

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
      const updatedUser = {
        ...mockOriginalUser,
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
      const existingUser = mockExistingUserForUpdateProfile;

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
      const currentUser = mockCurrentUser;
      const updatedUser = mockUpdatedCurrentUser;

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
