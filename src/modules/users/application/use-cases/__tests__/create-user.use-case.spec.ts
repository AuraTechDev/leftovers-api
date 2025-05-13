/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../create-user.use-case';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';
import { User } from '../../../domain/entities/user.entity';
import { Role, Provider } from '@prisma/client';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const usersRepositoryMock = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully create a user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: Role.USER,
        provider: Provider.LOCAL,
      };

      const expectedUser: User = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        role: Role.USER,
        provider: Provider.LOCAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findByEmail.mockResolvedValue(null);
      usersRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(usersRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(expectedUser.id);
      expect(result.name).toEqual(expectedUser.name);
      expect(result.email).toEqual(expectedUser.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser: User = {
        id: 1,
        name: 'Existing User',
        email: createUserDto.email,
        password: 'hashedpassword',
        role: Role.USER,
        provider: Provider.LOCAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if BUSINESS role without businessId', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Business User',
        email: 'business@example.com',
        password: 'password123',
        role: Role.BUSINESS,
      };

      // Act & Assert
      await expect(
        useCase.execute(createUserDto, Role.SUPER_ADMIN),
      ).rejects.toThrow(ForbiddenException);
      // No se llama findByEmail porque la validación ocurre antes
      expect(usersRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if non-SUPER_ADMIN tries to create BUSINESS user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Business User',
        email: 'business@example.com',
        password: 'password123',
        role: Role.BUSINESS,
        businessId: 1,
      };

      // Act & Assert
      await expect(useCase.execute(createUserDto, Role.USER)).rejects.toThrow(
        ForbiddenException,
      );
      // No se llama findByEmail porque la validación ocurre antes
      expect(usersRepository.create).not.toHaveBeenCalled();
    });
  });
});
