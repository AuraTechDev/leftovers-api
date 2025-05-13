/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from '../update-user.use-case';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { User } from '../../../domain/entities/user.entity';
import { Role, Provider } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from '../../dtos/update-user.dto';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const usersRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 1;
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
      provider: Provider.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update user successfully', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser: User = {
        ...mockUser,
        name: updateUserDto.name ?? mockUser.name,
        email: updateUserDto.email ?? mockUser.email,
        updatedAt: new Date(),
      };

      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await useCase.execute(userId, updateUserDto);

      // Assert
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(usersRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(updatedUser.id);
      expect(result.name).toEqual(updatedUser.name);
      expect(result.email).toEqual(updatedUser.email);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if BUSINESS role without businessId', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        role: Role.BUSINESS,
      };

      // Act & Assert
      await expect(
        useCase.execute(userId, updateUserDto, Role.SUPER_ADMIN),
      ).rejects.toThrow(ForbiddenException);
      // This exception is thrown before repository calls
      expect(usersRepository.findById).not.toHaveBeenCalled();
      expect(usersRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-SUPER_ADMIN tries to change role', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        role: Role.USER,
      };

      // Act & Assert
      await expect(
        useCase.execute(userId, updateUserDto, Role.BUSINESS),
      ).rejects.toThrow(ForbiddenException);
      // This exception is thrown before repository calls
      expect(usersRepository.findById).not.toHaveBeenCalled();
      expect(usersRepository.update).not.toHaveBeenCalled();
    });
  });
});
