/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensUseCase } from '../refresh-tokens.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { Provider, Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../../users/domain/entities/user.entity';
import {
  mockValidRefreshToken,
  mockExpiredRefreshToken,
} from '../../../__mocks__/auth.mocks';

describe('RefreshTokensUseCase', () => {
  let useCase: RefreshTokensUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const authRepositoryMock = {
      findRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
      createRefreshToken: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('new-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokensUseCase,
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

    useCase = module.get<RefreshTokensUseCase>(RefreshTokensUseCase);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should refresh tokens successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        role: Role.USER,
        provider: Provider.LOCAL,
        providerId: undefined,
        photoUrl: undefined,
        businessId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tokenData = mockValidRefreshToken;

      authRepository.findRefreshToken.mockResolvedValue(tokenData);
      authRepository.deleteRefreshToken.mockResolvedValue(undefined);
      authRepository.createRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(refreshToken);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toEqual('new-jwt-token');
      expect(result.refreshToken).toBeDefined();

      expect(authRepository.findRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(authRepository.createRefreshToken).toHaveBeenCalledWith(
        user.id,
        expect.any(String),
        expect.any(Date),
      );
    });

    it('should throw UnauthorizedException if token not found', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';

      authRepository.findRefreshToken.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.findRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authRepository.deleteRefreshToken).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token expired', async () => {
      // Arrange
      const refreshToken = 'expired-refresh-token';
      const tokenData = mockExpiredRefreshToken;

      authRepository.findRefreshToken.mockResolvedValue(tokenData);

      // Act & Assert
      await expect(useCase.execute(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authRepository.findRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
      expect(authRepository.deleteRefreshToken).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(authRepository.createRefreshToken).not.toHaveBeenCalled();
    });
  });
});
