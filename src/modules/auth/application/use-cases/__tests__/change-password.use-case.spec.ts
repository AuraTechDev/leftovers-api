/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from '../change-password.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Provider, Role, User } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ChangePasswordDto } from '../../../infrastructure/dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

// Mock para bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('new-hashed-password'),
}));

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findUserById: jest.fn(),
      updateUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should change password successfully', async () => {
      // Arrange
      const userId = 1;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      const user: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-current-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      authRepository.updateUser.mockResolvedValue({
        ...user,
        password: 'new-hashed-password',
      });

      // Act
      await useCase.execute(userId, changePasswordDto);

      // Assert
      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      );
      expect(authRepository.updateUser).toHaveBeenCalledWith(userId, {
        password: 'new-hashed-password',
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      const userId = 999;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      authRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId, changePasswordDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user has no password (OAuth account)', async () => {
      // Arrange
      const userId = 1;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      const user: User = {
        id: userId,
        name: 'OAuth User',
        email: 'oauth@example.com',
        password: null,
        role: Role.USER,
        provider: Provider.GOOGLE,
        providerId: 'google-id',
        photoUrl: 'https://photo.url',
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserById.mockResolvedValue(user);

      // Act & Assert
      await expect(useCase.execute(userId, changePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      // Arrange
      const userId = 1;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password',
      };

      const user: User = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-current-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(userId, changePasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        user.password,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.updateUser).not.toHaveBeenCalled();
    });
  });
});
