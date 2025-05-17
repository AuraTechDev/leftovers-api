import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleStrategy } from '../google.strategy';
import { ValidateOAuthUserUseCase } from '../../../application/use-cases';
import { Provider, Role } from '@prisma/client';
import { authConfig } from '../../../../../config/auth.config';

// Mock authConfig to enable Google OAuth for tests
jest.mock('../../../../../config/auth.config', () => ({
  authConfig: {
    providers: {
      google: {
        enabled: true,
        clientID: 'test-client-id',
        clientSecret: 'test-client-secret',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        scope: ['email', 'profile'],
      },
    },
  },
}));

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let validateOAuthUserUseCase: jest.Mocked<ValidateOAuthUserUseCase>;

  beforeEach(async () => {
    // Create mock use case
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
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user when Google profile is valid', async () => {
      // Mock Google profile
      const profile = {
        id: 'google-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@example.com' }],
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };

      // Mock access and refresh tokens
      const accessToken = 'mock-access-token';
      const refreshToken = 'mock-refresh-token';

      // Mock user returned from use case
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        provider: Provider.GOOGLE,
        providerId: 'google-123',
        photoUrl: 'https://example.com/photo.jpg',
        role: Role.USER,
      };

      // Setup mock use case to return our user
      validateOAuthUserUseCase.execute.mockResolvedValue(mockUser);

      // Mock callback function
      const done = jest.fn();

      // Call validate
      await strategy.validate(accessToken, refreshToken, profile, done);

      // Verify use case was called with correct parameters
      expect(validateOAuthUserUseCase.execute).toHaveBeenCalledWith({
        provider: Provider.GOOGLE,
        providerId: 'google-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        photoUrl: 'https://example.com/photo.jpg',
      });

      // Verify callback was called with user and no error
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle profile without photos', async () => {
      // Mock Google profile without photos
      const profile = {
        id: 'google-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@example.com' }],
      };

      // Mock user returned from use case
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        provider: Provider.GOOGLE,
        providerId: 'google-123',
        role: Role.USER,
      };

      // Setup mock use case
      validateOAuthUserUseCase.execute.mockResolvedValue(mockUser);

      // Mock callback function
      const done = jest.fn();

      // Call validate
      await strategy.validate('token', 'refresh', profile, done);

      // Verify use case was called with correct parameters (no photoUrl)
      expect(validateOAuthUserUseCase.execute).toHaveBeenCalledWith({
        provider: Provider.GOOGLE,
        providerId: 'google-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        photoUrl: undefined,
      });

      // Verify callback was called with user and no error
      expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('should return UnauthorizedException when profile has no email', async () => {
      // Mock Google profile without emails
      const profile = {
        id: 'google-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [], // Empty emails array
      };

      // Mock callback function
      const done = jest.fn();

      // Call validate
      await strategy.validate('token', 'refresh', profile, done);

      // Verify callback was called with UnauthorizedException
      expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), null);
      expect(validateOAuthUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should handle errors from use case', async () => {
      // Mock Google profile
      const profile = {
        id: 'google-123',
        name: {
          givenName: 'John',
          familyName: 'Doe',
        },
        emails: [{ value: 'john.doe@example.com' }],
      };

      // Setup mock use case to throw error
      const error = new Error('Failed to validate user');
      validateOAuthUserUseCase.execute.mockRejectedValue(error);

      // Mock callback function
      const done = jest.fn();

      // Call validate
      await strategy.validate('token', 'refresh', profile, done);

      // Verify callback was called with error
      expect(done).toHaveBeenCalledWith(error, null);
    });
  });
}); 