/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from '../auth.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Provider, Role } from '@prisma/client';
import { User } from '../../../../users/domain/entities/user.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import {
  mockUser,
  mockGoogleUser,
  mockRefreshToken,
  mockPrismaService,
} from '../../../__mocks__/auth.mocks';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findUserByEmail', () => {
    const findUserByEmail = async (): Promise<void> => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockUser.email);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    };

    const findUserByEmailNotFound = async (): Promise<void> => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findUserByEmail(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    };

    it('should return a user when found', findUserByEmail);
    it('should return null when user not found', findUserByEmailNotFound);
  });

  describe('findUserById', () => {
    const findUserById = async (): Promise<void> => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await repository.findUserById(1);

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUser.id);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    };

    const findUserByIdNotFound = async (): Promise<void> => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.findUserById(999);

      expect(result).toBeNull();
    };

    it('should return a user when found', findUserById);
    it('should return null when user not found', findUserByIdNotFound);
  });

  describe('findUserByProviderAndProviderId', () => {
    const findUserByProvider = async (): Promise<void> => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(
        mockGoogleUser,
      );

      const result = await repository.findUserByProviderAndProviderId(
        Provider.GOOGLE,
        'google-123',
      );

      expect(result).toBeInstanceOf(User);
      expect(result?.provider).toBe(Provider.GOOGLE);
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          provider: Provider.GOOGLE,
          providerId: 'google-123',
        },
      });
    };

    const findUserByProviderNotFound = async (): Promise<void> => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await repository.findUserByProviderAndProviderId(
        Provider.GOOGLE,
        'nonexistent-id',
      );

      expect(result).toBeNull();
    };

    it('should return a user when found', findUserByProvider);
    it('should return null when user not found', findUserByProviderNotFound);
  });

  describe('createUser', () => {
    const createUser = async (): Promise<void> => {
      const newUserData = {
        email: 'new@example.com',
        name: 'New User',
        password: 'password123',
        role: Role.USER,
        provider: Provider.LOCAL,
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...newUserData,
      });

      const result = await repository.createUser(newUserData);

      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(newUserData.email);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining(newUserData) as Record<string, unknown>,
      });
    };

    it('should create and return a new user', createUser);
  });

  describe('updateUser', () => {
    const updateUser = async (): Promise<void> => {
      const updateData = {
        name: 'Updated Name',
        photoUrl: 'https://example.com/photo.jpg',
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await repository.updateUser(1, updateData);

      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe(updateData.name);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    };

    it('should update and return the user', updateUser);
  });

  describe('createRefreshToken', () => {
    const createRefreshToken = async (): Promise<void> => {
      const token = 'new-refresh-token';
      const userId = 1;
      const expiresAt = new Date();

      await repository.createRefreshToken(userId, token, expiresAt);

      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: {
          token,
          userId,
          expiresAt,
        },
      });
    };

    it('should create a refresh token', createRefreshToken);
  });

  describe('findRefreshToken', () => {
    const findRefreshToken = async (): Promise<void> => {
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(
        mockRefreshToken,
      );

      const result = await repository.findRefreshToken('refresh-token');

      expect(result).toBeInstanceOf(RefreshToken);
      expect(result?.token).toBe(mockRefreshToken.token);
      expect(result?.user).toBeInstanceOf(User);
      expect(prismaService.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
        include: { user: true },
      });
    };

    const findRefreshTokenNotFound = async (): Promise<void> => {
      (prismaService.refreshToken.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await repository.findRefreshToken('nonexistent-token');

      expect(result).toBeNull();
    };

    it('should return a refresh token with user when found', findRefreshToken);
    it(
      'should return null when refresh token not found',
      findRefreshTokenNotFound,
    );
  });

  describe('deleteRefreshToken', () => {
    const deleteRefreshToken = async (): Promise<void> => {
      await repository.deleteRefreshToken('refresh-token');

      expect(prismaService.refreshToken.delete).toHaveBeenCalledWith({
        where: { token: 'refresh-token' },
      });
    };

    it('should delete a refresh token', deleteRefreshToken);
  });
});
