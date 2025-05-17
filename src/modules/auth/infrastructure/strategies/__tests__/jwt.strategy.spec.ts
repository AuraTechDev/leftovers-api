import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';
import { AuthRepository } from '../../repositories/auth.repository';
import { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    // Create mock repository with the methods we need
    const mockAuthRepository = {
      findUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a valid user when token payload is correct', async () => {
      // Mock JWT payload
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 9876543210,
        aud: 'leftovers-api-users',
        iss: 'leftovers-api',
      };

      // Mock user from database
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: Role.USER,
        isBlocked: false,
      };

      // Setup mock repository to return our user
      authRepository.findUserById.mockResolvedValue(mockUser);

      // Call validate and check result
      const result = await strategy.validate(payload);
      expect(result).toEqual(mockUser);
      expect(authRepository.findUserById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Mock JWT payload
      const payload = {
        sub: 'non-existent-user',
        email: 'ghost@example.com',
        iat: 1234567890,
        exp: 9876543210,
        aud: 'leftovers-api-users',
        iss: 'leftovers-api',
      };

      // Setup mock repository to return null (user not found)
      authRepository.findUserById.mockResolvedValue(null);

      // Expect validate to throw UnauthorizedException
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(authRepository.findUserById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when user is blocked', async () => {
      // Mock JWT payload
      const payload = {
        sub: 'blocked-user-id',
        email: 'blocked@example.com',
        iat: 1234567890,
        exp: 9876543210,
        aud: 'leftovers-api-users',
        iss: 'leftovers-api',
      };

      // Mock blocked user
      const mockBlockedUser = {
        id: 'blocked-user-id',
        email: 'blocked@example.com',
        role: Role.USER,
        isBlocked: true,
      };

      // Setup mock repository to return blocked user
      authRepository.findUserById.mockResolvedValue(mockBlockedUser);

      // Expect validate to throw UnauthorizedException
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(authRepository.findUserById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException when database query fails', async () => {
      // Mock JWT payload
      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 9876543210,
        aud: 'leftovers-api-users',
        iss: 'leftovers-api',
      };

      // Setup mock repository to throw error
      authRepository.findUserById.mockRejectedValue(new Error('Database error'));

      // Expect validate to throw UnauthorizedException
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(authRepository.findUserById).toHaveBeenCalledWith(payload.sub);
    });
  });
});
