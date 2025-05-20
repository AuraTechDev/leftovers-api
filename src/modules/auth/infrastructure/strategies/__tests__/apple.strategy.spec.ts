import { Test, TestingModule } from '@nestjs/testing';
import { AppleStrategy } from '../apple.strategy';
import { ValidateOAuthUserUseCase } from '../../../application/use-cases/validate-oauth-user.use-case';
import { Provider } from '@prisma/client';

describe('AppleStrategy', () => {
  let strategy: AppleStrategy;

  const mockValidateOAuthUserUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockProfile = {
      id: 'apple123',
      email: 'test@example.com',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    const mockDone = jest.fn();

    it('should successfully validate user with complete profile', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockValidateOAuthUserUseCase.execute.mockResolvedValue(mockUser);

      await strategy.validate(
        {},
        'accessToken',
        'refreshToken',
        'idToken',
        mockProfile,
        mockDone,
      );

      expect(mockValidateOAuthUserUseCase.execute).toHaveBeenCalledWith({
        provider: Provider.APPLE,
        providerId: 'apple123',
        email: 'test@example.com',
        name: 'John Doe',
        photoUrl: undefined,
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle profile without email', async () => {
      const profileWithoutEmail = { ...mockProfile, email: undefined };
      const mockUser = { id: 1, email: 'apple123@apple.user' };
      mockValidateOAuthUserUseCase.execute.mockResolvedValue(mockUser);

      await strategy.validate(
        {},
        'accessToken',
        'refreshToken',
        'idToken',
        profileWithoutEmail,
        mockDone,
      );

      expect(mockValidateOAuthUserUseCase.execute).toHaveBeenCalledWith({
        provider: Provider.APPLE,
        providerId: 'apple123',
        email: 'apple123@apple.user',
        name: 'John Doe',
        photoUrl: undefined,
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle profile without name', async () => {
      const profileWithoutName = { id: 'apple123', email: 'test@example.com' };
      const mockUser = { id: 1, email: 'test@example.com' };
      mockValidateOAuthUserUseCase.execute.mockResolvedValue(mockUser);

      await strategy.validate(
        {},
        'accessToken',
        'refreshToken',
        'idToken',
        profileWithoutName,
        mockDone,
      );

      expect(mockValidateOAuthUserUseCase.execute).toHaveBeenCalledWith({
        provider: Provider.APPLE,
        providerId: 'apple123',
        email: 'test@example.com',
        name: 'Apple User apple',
        photoUrl: undefined,
      });
      expect(mockDone).toHaveBeenCalledWith(null, mockUser);
    });

    it('should handle validation error', async () => {
      const error = new Error('Validation failed');
      mockValidateOAuthUserUseCase.execute.mockRejectedValue(error);

      await strategy.validate(
        {},
        'accessToken',
        'refreshToken',
        'idToken',
        mockProfile,
        mockDone,
      );

      expect(mockDone).toHaveBeenCalledWith(error);
    });
  });
});
