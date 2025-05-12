import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import { Provider, Role, User } from '@prisma/client';
import { RegisterDto } from '../../../infrastructure/dto/register.dto';
import { OAuthLoginDto } from '../../../infrastructure/dto/oauth-login.dto';
import * as bcrypt from 'bcryptjs';
import { AuthUser } from '../../../domain/interfaces/user.interface';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: Role.USER,
    photoUrl: null,
    provider: Provider.LOCAL,
    providerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRefreshToken = {
    id: 1,
    token: 'test-refresh-token',
    userId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: 'test@example.com', provider: Provider.LOCAL },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = mockUser;
      expect(result).toEqual(expectedResult);
    });

    it('should return null when user is not found', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(
        'test@example.com',
        'wrong-password',
      );

      expect(result).toBeNull();
    });
  });

  describe('validateOAuthUser', () => {
    const oauthData: OAuthLoginDto = {
      email: 'oauth@example.com',
      name: 'OAuth User',
      photoUrl: 'https://example.com/photo.jpg',
      provider: Provider.GOOGLE,
      providerId: 'google-123',
    };

    it('should return existing user when found', async () => {
      const existingUser: User = {
        ...mockUser,
        email: oauthData.email,
        name: oauthData.name,
        photoUrl: oauthData.photoUrl || null,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      };

      const findFirstSpy = jest.spyOn(prismaService.user, 'findFirst');
      findFirstSpy.mockResolvedValue(existingUser);

      const result = await authService.validateOAuthUser(oauthData);

      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          provider: oauthData.provider,
          providerId: oauthData.providerId,
        },
      });
      expect(result).toEqual(existingUser);
    });

    it('should create new user when not found', async () => {
      const newUser: User = {
        ...mockUser,
        email: oauthData.email,
        name: oauthData.name,
        photoUrl: oauthData.photoUrl || null,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      };

      const findFirstSpy = jest.spyOn(prismaService.user, 'findFirst');
      findFirstSpy.mockResolvedValue(null);

      const createSpy = jest.spyOn(prismaService.user, 'create');
      createSpy.mockResolvedValue(newUser);

      const result = await authService.validateOAuthUser(oauthData);

      expect(createSpy).toHaveBeenCalledWith({
        data: {
          email: oauthData.email,
          name: oauthData.name,
          photoUrl: oauthData.photoUrl,
          provider: oauthData.provider,
          providerId: oauthData.providerId,
          role: Role.USER,
        },
      });
      expect(result).toEqual(newUser);
    });

    it('should update user when profile information changed', async () => {
      const existingUser: User = {
        ...mockUser,
        email: oauthData.email,
        name: 'Old Name',
        photoUrl: 'old-photo-url',
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      };

      const updatedUser: User = {
        ...existingUser,
        name: oauthData.name,
        photoUrl: oauthData.photoUrl || null,
      };

      const findFirstSpy = jest.spyOn(prismaService.user, 'findFirst');
      findFirstSpy.mockResolvedValue(existingUser);

      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue(updatedUser);

      const result = await authService.validateOAuthUser(oauthData);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: existingUser.id },
        data: {
          name: oauthData.name,
          photoUrl: oauthData.photoUrl,
        },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('login', () => {
    it('should return user, access token and refresh token', async () => {
      const authUser: AuthUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        photoUrl: undefined,
        provider: Provider.LOCAL,
      };

      const createRefreshTokenSpy = jest.spyOn(
        prismaService.refreshToken,
        'create',
      );
      createRefreshTokenSpy.mockResolvedValue(mockRefreshToken);

      const result = await authService.login(authUser);

      const signSpy = jest.spyOn(jwtService, 'sign');
      expect(signSpy).toHaveBeenCalledWith({
        sub: authUser.id,
        email: authUser.email,
        role: authUser.role,
      });
      expect(result).toEqual({
        user: authUser,
        accessToken: 'test-token',
        refreshToken: mockRefreshToken.token,
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'password123',
    };

    it('should register a new user and return tokens', async () => {
      const createdUser: User = {
        ...mockUser,
        email: registerDto.email,
        name: registerDto.name,
      };

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      const createSpy = jest.spyOn(prismaService.user, 'create');
      createSpy.mockResolvedValue(createdUser);

      const createRefreshTokenSpy = jest.spyOn(
        prismaService.refreshToken,
        'create',
      );
      createRefreshTokenSpy.mockResolvedValue(mockRefreshToken);

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await authService.register(registerDto);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          password: 'hashed-password',
          role: Role.USER,
          provider: Provider.LOCAL,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedUser } = createdUser;
      expect(result).toEqual({
        user: expectedUser,
        accessToken: 'test-token',
        refreshToken: mockRefreshToken.token,
      });
    });

    it('should throw an exception when email is already registered', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new UnauthorizedException('El email ya está registrado'),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new access and refresh tokens when valid', async () => {
      const findUniqueSpy = jest.spyOn(
        prismaService.refreshToken,
        'findUnique',
      );
      findUniqueSpy.mockResolvedValue(mockRefreshToken);

      const deleteSpy = jest.spyOn(prismaService.refreshToken, 'delete');
      deleteSpy.mockResolvedValue(mockRefreshToken);

      const createRefreshTokenSpy = jest.spyOn(
        prismaService.refreshToken,
        'create',
      );
      createRefreshTokenSpy.mockResolvedValue({
        ...mockRefreshToken,
        token: 'new-refresh-token',
      });

      const result = await authService.refreshTokens('test-refresh-token');

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { token: 'test-refresh-token' },
        include: { user: true },
      });
      expect(deleteSpy).toHaveBeenCalledWith({
        where: { token: 'test-refresh-token' },
      });
      expect(result).toEqual({
        accessToken: 'test-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException when refresh token is not found', async () => {
      const findUniqueSpy = jest.spyOn(
        prismaService.refreshToken,
        'findUnique',
      );
      findUniqueSpy.mockResolvedValue(null);

      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };

      const findUniqueSpy = jest.spyOn(
        prismaService.refreshToken,
        'findUnique',
      );
      findUniqueSpy.mockResolvedValue(expiredToken);

      await expect(authService.refreshTokens('expired-token')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    });
  });

  describe('logout', () => {
    it('should delete the refresh token', async () => {
      const deleteSpy = jest.spyOn(prismaService.refreshToken, 'delete');
      deleteSpy.mockResolvedValue(mockRefreshToken);

      await authService.logout('test-refresh-token');

      expect(deleteSpy).toHaveBeenCalledWith({
        where: { token: 'test-refresh-token' },
      });
    });
  });
});
