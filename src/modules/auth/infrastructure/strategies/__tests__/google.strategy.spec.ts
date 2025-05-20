/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from '../google.strategy';
import { ValidateOAuthUserUseCase } from '../../../application/use-cases/validate-oauth-user.use-case';
import { Provider, Role } from '@prisma/client';

// Import GoogleProfile interface
interface GoogleProfile {
  id: string;
  name: {
    givenName: string;
    familyName: string;
  };
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

jest.mock('../../../../../config/env.config', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3000/auth/google/callback',
    GOOGLE_SCOPE: ['email', 'profile'],
  },
}));

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let validateOAuthUserUseCase: jest.Mocked<ValidateOAuthUserUseCase>;

  beforeEach(async () => {
    const mockValidateOAuthUserUseCase = {
      execute: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ValidateOAuthUserUseCase,
          useValue: mockValidateOAuthUserUseCase,
        },
      ],
    }).compile();
    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    validateOAuthUserUseCase = module.get(ValidateOAuthUserUseCase);
    jest.spyOn(validateOAuthUserUseCase, 'execute');
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user', async () => {
    const profile: GoogleProfile = {
      id: 'google-123',
      name: { givenName: 'John', familyName: 'Doe' },
      emails: [{ value: 'john.doe@example.com' }],
      photos: [{ value: 'https://example.com/photo.jpg' }],
    };
    const mockUser = {
      id: 1,
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: undefined,
      photoUrl: 'https://example.com/photo.jpg',
      role: Role.USER,
      provider: Provider.GOOGLE,
      providerId: 'google-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      businessId: undefined,
    };
    validateOAuthUserUseCase.execute.mockResolvedValue(mockUser);
    const done = jest.fn();
    await strategy.validate('token', 'refresh', profile, done);
    expect(validateOAuthUserUseCase.execute).toHaveBeenCalledWith({
      provider: Provider.GOOGLE,
      providerId: 'google-123',
      email: 'john.doe@example.com',
      name: 'John Doe',
      photoUrl: 'https://example.com/photo.jpg',
    });
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('should return UnauthorizedException if no email', async () => {
    const profile: GoogleProfile = {
      id: 'google-123',
      name: { givenName: 'John', familyName: 'Doe' },
      emails: [],
    };
    const done = jest.fn();
    await strategy.validate('token', 'refresh', profile, done);
    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
    expect(validateOAuthUserUseCase.execute).not.toHaveBeenCalled();
  });

  it('should handle use-case error', async () => {
    const profile: GoogleProfile = {
      id: 'google-123',
      name: { givenName: 'John', familyName: 'Doe' },
      emails: [{ value: 'john.doe@example.com' }],
    };
    const error = new Error('Failed to validate user');
    validateOAuthUserUseCase.execute.mockRejectedValue(error);
    const done = jest.fn();
    await strategy.validate('token', 'refresh', profile, done);
    expect(done).toHaveBeenCalledWith(error, false);
  });
});
