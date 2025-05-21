import { Provider, Role } from '@prisma/client';
import { User } from '../../users/domain/entities/user.entity';
import { RegisterDto } from '../application/dtos/register.dto';
import { OAuthLoginDto } from '../application/dtos/oauth-login.dto';
import { AuthUser } from '../domain/interfaces/user.interface';
import { AuthResponseDto } from '../application/dtos/auth-response.dto';
import { UserDto } from '../application/dtos/auth-response.dto';

// Base mocks
export const baseUser: User = {
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

export const baseOAuthUser: User = {
  ...baseUser,
  provider: Provider.GOOGLE,
  providerId: 'google-123',
  photoUrl: 'https://example.com/photo.jpg',
};

export const baseAuthResponse: AuthResponseDto = {
  user: {
    id: baseUser.id,
    email: baseUser.email,
    name: baseUser.name,
    role: baseUser.role,
    photoUrl: baseUser.photoUrl,
    provider: baseUser.provider,
    businessId: undefined,
  },
  accessToken: 'test-token',
  refreshToken: 'test-refresh-token',
};

// Derived mocks
export const mockUser = baseUser;
export const mockLocalUser = baseUser;
export const mockCreatedUser = baseUser;

export const mockGoogleUser = baseOAuthUser;

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

export const mockExistingUser: User = {
  ...baseUser,
  email: 'existing@example.com',
  name: 'Existing User',
};

// Mocks for refresh tokens use case tests
export const mockValidRefreshToken = {
  token: 'valid-refresh-token',
  userId: 1,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  user: mockUser,
};

export const mockExpiredRefreshToken = {
  token: 'expired-refresh-token',
  userId: 1,
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  user: mockUser,
};

// Mocks for update profile use case tests
export const mockUpdateProfileDto = {
  name: 'Updated Name',
  photoUrl: 'https://new-photo.url',
};

export const mockOriginalUser: User = {
  ...baseUser,
  name: 'Original Name',
};

export const mockUpdatedUser: User = {
  ...mockOriginalUser,
  name: mockUpdateProfileDto.name,
  photoUrl: mockUpdateProfileDto.photoUrl,
};

export const mockExistingUserForUpdateProfile: User = {
  ...baseUser,
  id: 2,
  name: 'Another User',
  email: 'existing@example.com',
};

export const mockCurrentUser: User = {
  ...baseUser,
  name: 'Current User',
  email: 'current@example.com',
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

export const mockOAuthUser = baseOAuthUser;

export const mockOAuthExistingUser: User = {
  ...baseOAuthUser,
  name: 'Old Name',
  photoUrl: 'https://example.com/old-photo.jpg',
};

export const mockOAuthUpdatedUser = baseOAuthUser;

// Mocks for validate-user use case tests
export const mockGoogleUserForValidate: User = {
  ...baseOAuthUser,
  providerId: 'google-id',
};

// Mocks for auth controller tests
export const mockAuthUser: AuthUser = {
  id: baseUser.id,
  email: baseUser.email,
  name: baseUser.name,
  role: baseUser.role,
  provider: baseUser.provider,
  photoUrl: 'test-photo-url',
};

export const mockRegisterResponse = baseAuthResponse;
export const mockLoginResponse = baseAuthResponse;

export const mockRefreshResponse = {
  accessToken: 'new-test-token',
  refreshToken: 'new-test-refresh-token',
};

export const mockUpdatedUserDto: UserDto = {
  id: mockAuthUser.id,
  name: 'Updated Name',
  email: 'updated@example.com',
  photoUrl: 'https://updated-photo-url.com',
  role: mockAuthUser.role,
  provider: mockAuthUser.provider,
  businessId: undefined,
};

// Mocks for controller guard tests
export const mockJwtAuthGuard = { canActivate: jest.fn() };
export const mockGoogleAuthGuard = { canActivate: jest.fn() };
export const mockAppleAuthGuard = { canActivate: jest.fn() };
export const mockRolesGuard = { canActivate: jest.fn() };
