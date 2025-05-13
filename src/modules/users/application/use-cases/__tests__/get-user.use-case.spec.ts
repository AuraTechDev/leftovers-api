/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from '../get-user.use-case';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { User } from '../../../domain/entities/user.entity';
import { Role, Provider } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const usersRepositoryMock = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user when found', async () => {
      // Arrange
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

      usersRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(userId);

      // Assert
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockUser.id);
      expect(result.name).toEqual(mockUser.name);
      expect(result.email).toEqual(mockUser.email);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = '999';
      usersRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
