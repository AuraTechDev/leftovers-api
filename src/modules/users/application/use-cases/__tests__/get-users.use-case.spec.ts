/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersUseCase } from '../get-users.use-case';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { User } from '../../../domain/entities/user.entity';
import { Role, Provider } from '@prisma/client';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const usersRepositoryMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
          role: Role.USER,
          provider: Provider.LOCAL,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password456',
          role: Role.BUSINESS,
          provider: Provider.LOCAL,
          businessId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      usersRepository.findAll.mockResolvedValue(mockUsers);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(usersRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toEqual(mockUsers[0].id);
      expect(result[1].id).toEqual(mockUsers[1].id);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      usersRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(usersRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
