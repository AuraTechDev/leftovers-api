/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '../delete-user.use-case';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { User } from '../../../domain/entities/user.entity';
import { Role, Provider } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const usersRepositoryMock = {
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = '1';
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

    it('should delete user successfully', async () => {
      // Arrange
      usersRepository.findById.mockResolvedValue(mockUser);
      usersRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(userId);

      // Assert
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(usersRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(usersRepository.delete).not.toHaveBeenCalled();
    });
  });
});
