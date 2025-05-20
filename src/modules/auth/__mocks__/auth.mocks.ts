import { Provider, Role } from '@prisma/client';
import { User } from '../../users/domain/entities/user.entity';
import { RegisterDto } from '../application/dtos/register.dto';
import { OAuthLoginDto } from '../application/dtos/oauth-login.dto';

export const mockUser: User = {
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

export const mockGoogleUser = {
  ...mockUser,
  provider: Provider.GOOGLE,
  providerId: 'google-123',
};

export const mockRefreshToken = {
  token: 'refresh-token',
  userId: 1,
  expiresAt: new Date(),
  user: mockUser,
};

export const mockPrismaService = {
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
};

// Mocks for register use case tests
export const mockRegisterDto: RegisterDto = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

export const mockCreatedUser: User = {
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

export const mockExistingUser: User = {
  id: 1,
  name: 'Existing User',
  email: 'existing@example.com',
  password: 'hashed-password',
  role: Role.USER,
  provider: Provider.LOCAL,
  providerId: undefined,
  photoUrl: undefined,
  businessId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mocks for refresh tokens use case tests
export const mockValidRefreshToken = {
  token: 'valid-refresh-token',
  userId: 1,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Un día en el futuro
  user: mockUser,
};

export const mockExpiredRefreshToken = {
  token: 'expired-refresh-token',
  userId: 1,
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Un día en el pasado
  user: mockUser,
};

// Mocks for update profile use case tests
export const mockUpdateProfileDto = {
  name: 'Updated Name',
  photoUrl: 'https://new-photo.url',
};

export const mockOriginalUser: User = {
  id: 1,
  name: 'Original Name',
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

export const mockUpdatedUser: User = {
  ...mockOriginalUser,
  name: mockUpdateProfileDto.name,
  photoUrl: mockUpdateProfileDto.photoUrl,
};

export const mockExistingUserForUpdateProfile: User = {
  id: 2,
  name: 'Another User',
  email: 'existing@example.com',
  password: 'hashed-password',
  role: Role.USER,
  provider: Provider.LOCAL,
  providerId: undefined,
  photoUrl: undefined,
  businessId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockCurrentUser: User = {
  id: 1,
  name: 'Current User',
  email: 'current@example.com',
  password: 'hashed-password',
  role: Role.USER,
  provider: Provider.LOCAL,
  providerId: undefined,
  photoUrl: undefined,
  businessId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUpdatedCurrentUser: User = {
  ...mockCurrentUser,
  name: 'Updated Name',
};

// Mocks for validate-oauth-user use case tests
export const mockOAuthData: OAuthLoginDto = {
  provider: Provider.GOOGLE,
  providerId: 'google-123',
  email: 'test@example.com',
  name: 'Test User',
  photoUrl: 'https://example.com/photo.jpg',
};

export const mockOAuthUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: undefined,
  role: Role.USER,
  provider: Provider.GOOGLE,
  providerId: 'google-123',
  photoUrl: 'https://example.com/photo.jpg',
  businessId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOAuthExistingUser: User = {
  ...mockOAuthUser,
  name: 'Old Name',
  photoUrl: 'https://example.com/old-photo.jpg',
};

export const mockOAuthUpdatedUser: User = {
  ...mockOAuthUser,
};

// Mocks for validate-user use case tests
export const mockLocalUser: User = {
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

export const mockGoogleUserForValidate: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  role: Role.USER,
  provider: Provider.GOOGLE,
  providerId: 'google-id',
  photoUrl: undefined,
  businessId: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};
