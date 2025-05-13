/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RegisterUseCase } from '../register.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { RegisterDto } from '../../../infrastructure/dto/register.dto';
import { Provider, Role, User } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      createRefreshToken: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const createdUser: User = {
        id: 1,
        name: 'Test User',
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

      authRepository.findUserByEmail.mockResolvedValue(null);
      authRepository.createUser.mockResolvedValue(createdUser);
      authRepository.createRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toEqual(createdUser.id);
      expect(result.user.email).toEqual(createdUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(authRepository.createUser).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
      expect(authRepository.createRefreshToken).toHaveBeenCalledWith(
        createdUser.id,
        expect.any(String),
        expect.any(Date),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser: User = {
        id: 1,
        name: 'Existing User',
        email: 'existing@example.com',
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
      await expect(useCase.execute(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(authRepository.createUser).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
    });
  });
});
