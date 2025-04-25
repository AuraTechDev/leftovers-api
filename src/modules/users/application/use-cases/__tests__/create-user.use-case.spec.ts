import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../create-user.use-case';
import { UsersService } from '../../../infrastructure/services/users.service';
import { User } from '../../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const usersServiceMock = {
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully create a user', async () => {
      // Arrange
      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'password123';

      const expectedUser: User = {
        id: '1',
        name,
        email,
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFn = jest.fn().mockResolvedValue(expectedUser);
      usersService.createUser = mockFn;

      // Act
      const result = await useCase.execute(name, email, password);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockFn).toHaveBeenCalledWith({
        name,
        email,
        password,
      });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
