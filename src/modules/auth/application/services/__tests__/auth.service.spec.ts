import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Provider, Role, User } from '@prisma/client';
import { RegisterDto } from '../../../infrastructure/dto/register.dto';
import { OAuthLoginDto } from '../../../infrastructure/dto/oauth-login.dto';
import * as bcrypt from 'bcryptjs';
import { AuthUser } from '../../../domain/interfaces/user.interface';
import { UpdateProfileDto } from '../../../infrastructure/dto/update-profile.dto';
import { ChangePasswordDto } from '../../../infrastructure/dto/change-password.dto';

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
    businessId: null,
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

      // Mock the private method that generates the refresh token
      jest
        .spyOn<any, any>(authService, 'createRefreshToken')
        .mockResolvedValue('test-refresh-token');

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
        refreshToken: 'test-refresh-token',
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

      // Mock the private method that generates the refresh token
      jest
        .spyOn<any, any>(authService, 'createRefreshToken')
        .mockResolvedValue('test-refresh-token');

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
        refreshToken: 'test-refresh-token',
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

      // Mock the private method that generates the refresh token
      jest
        .spyOn<any, any>(authService, 'createRefreshToken')
        .mockResolvedValue('new-refresh-token');

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

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      photoUrl: 'https://updated-photo-url.com',
    };

    it('should update user profile successfully', async () => {
      const userId = 1;
      const updatedUser: User = {
        ...mockUser,
        name: updateProfileDto.name!,
        email: updateProfileDto.email!,
        photoUrl: updateProfileDto.photoUrl || null,
      };

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValueOnce(mockUser); // First call to check if user exists

      // No existing user with updated email
      findUniqueSpy.mockResolvedValueOnce(null);

      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, updateProfileDto);

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateProfileDto,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...expectedUser } = updatedUser;
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      await expect(
        authService.updateProfile(userId, updateProfileDto),
      ).rejects.toThrow(new NotFoundException('Usuario no encontrado'));
    });

    it('should throw BadRequestException when email is already in use', async () => {
      const userId = 1;
      const existingUser = { ...mockUser, id: 2 }; // Different user with the same email

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValueOnce(mockUser); // First call to check if user exists
      findUniqueSpy.mockResolvedValueOnce(existingUser); // Second call to check if email exists

      await expect(
        authService.updateProfile(userId, {
          email: 'updated@example.com',
        }),
      ).rejects.toThrow(new BadRequestException('El email ya está en uso'));
    });

    it('should only update provided fields', async () => {
      const userId = 1;
      const partialUpdateDto: UpdateProfileDto = {
        name: 'Updated Name',
      };

      const updatedUser: User = {
        ...mockUser,
        name: partialUpdateDto.name!,
      };

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, partialUpdateDto);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: partialUpdateDto,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...expectedUser } = updatedUser;
      expect(result).toEqual(expectedUser);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'current-password',
      newPassword: 'new-password',
    };

    it('should change password successfully', async () => {
      const userId = 1;

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue({
        ...mockUser,
        password: 'new-hashed-password',
      });

      const result = await authService.changePassword(
        userId,
        changePasswordDto,
      );

      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      );
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'new-hashed-password' },
      });
      expect(result).toEqual({
        message: 'Contraseña actualizada exitosamente',
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = 999;
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(new NotFoundException('Usuario no encontrado'));
    });

    it('should throw BadRequestException for OAuth users without password', async () => {
      const userId = 1;
      const oauthUser: User = {
        ...mockUser,
        password: null,
        provider: Provider.GOOGLE,
      };

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(oauthUser);

      await expect(
        authService.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new BadRequestException(
          'No es posible cambiar la contraseña para usuarios de proveedores externos',
        ),
      );
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const userId = 1;

      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(
        new UnauthorizedException('La contraseña actual es incorrecta'),
      );
    });
  });
});
