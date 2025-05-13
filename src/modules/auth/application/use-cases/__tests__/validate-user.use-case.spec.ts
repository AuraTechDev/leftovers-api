/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ValidateUserUseCase } from '../validate-user.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Provider, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Mock para bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('ValidateUserUseCase', () => {
  let useCase: ValidateUserUseCase;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findUserByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<ValidateUserUseCase>(ValidateUserUseCase);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should validate a user with correct credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      const user: User = {
        id: 1,
        name: 'Test User',
        email,
        password: hashedPassword,
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await useCase.execute(email, password);

      // Assert
      expect(result).not.toBeNull();
      // Asegurándonos de que result no es null antes de acceder a sus propiedades
      if (result) {
        expect(result.id).toEqual(user.id);
        expect(result.email).toEqual(user.email);
      }

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return null if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      authRepository.findUserByEmail.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(email, password);

      // Assert
      expect(result).toBeNull();
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if provider is not LOCAL', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      const user: User = {
        id: 1,
        name: 'Test User',
        email,
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.GOOGLE,
        providerId: 'google-id',
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserByEmail.mockResolvedValue(user);

      // Act
      const result = await useCase.execute(email, password);

      // Assert
      expect(result).toBeNull();
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      const hashedPassword = 'hashed-password';

      const user: User = {
        id: 1,
        name: 'Test User',
        email,
        password: hashedPassword,
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: null,
        photoUrl: null,
        businessId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      authRepository.findUserByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await useCase.execute(email, password);

      // Assert
      expect(result).toBeNull();
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
