import { Test, TestingModule } from '@nestjs/testing';
import { AppleStrategy } from '../apple.strategy';
import { ValidateOAuthUserUseCase } from '../../../application/use-cases';
import { Provider } from '@prisma/client';

jest.mock('../../../../config/env.config', () => ({
  env: {
    APPLE_CLIENT_ID: 'test-apple-client-id',
    APPLE_CLIENT_SECRET: 'test-apple-client-secret',
    APPLE_CALLBACK_URL: 'http://localhost:3000/auth/apple/callback',
    APPLE_KEY_ID: 'test-key-id',
    APPLE_PRIVATE_KEY_LOCATION: 'test/path/to/key',
    APPLE_SCOPE: ['name', 'email'],
  },
}));

describe('AppleStrategy', () => {
  let strategy: AppleStrategy;
  let validateOAuthUserUseCase: jest.Mocked<ValidateOAuthUserUseCase>;

  beforeEach(async () => {
    const mockValidateOAuthUserUseCase = {
      execute: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleStrategy,
        {
          provide: ValidateOAuthUserUseCase,
          useValue: mockValidateOAuthUserUseCase,
        },
      ],
    }).compile();
    strategy = module.get<AppleStrategy>(AppleStrategy);
    validateOAuthUserUseCase = module.get(ValidateOAuthUserUseCase);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user', async () => {
    const profile = {
      id: 'apple-123',
      email: 'apple.user@example.com',
      name: { firstName: 'Apple', lastName: 'User' },
    };
    const mockUser = { id: 1, email: 'apple.user@example.com' };
    validateOAuthUserUseCase.execute.mockResolvedValue(mockUser);
    const done = jest.fn();
    await strategy.validate({}, 'access', 'refresh', 'idtoken', profile as any, done);
    expect(validateOAuthUserUseCase.execute).toHaveBeenCalledWith({
      provider: Provider.APPLE,
      providerId: 'apple-123',
      email: 'apple.user@example.com',
      name: 'Apple User',
      photoUrl: undefined,
    });
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('should use fallback email if not provided', async () => {
    const profile = {
      id: 'apple-456',
      name: { firstName: 'Apple', lastName: 'Fallback' },
    };
    const mockUser = { id: 2, email: 'apple-456@apple.user' };
    validateOAuthUserUseCase.execute.mockResolvedValue(mockUser);
    const done = jest.fn();
    await strategy.validate({}, 'access', 'refresh', 'idtoken', profile as any, done);
    expect(validateOAuthUserUseCase.execute).toHaveBeenCalledWith({
      provider: Provider.APPLE,
      providerId: 'apple-456',
      email: 'apple-456@apple.user',
      name: 'Apple Fallback',
      photoUrl: undefined,
    });
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('should handle use-case error', async () => {
    const profile = {
      id: 'apple-789',
      email: 'fail.user@example.com',
      name: { firstName: 'Fail', lastName: 'User' },
    };
    const error = new Error('Failed to validate user');
    validateOAuthUserUseCase.execute.mockRejectedValue(error);
    const done = jest.fn();
    await strategy.validate({}, 'access', 'refresh', 'idtoken', profile as any, done);
    expect(done).toHaveBeenCalledWith(error, null);
  });
}); 