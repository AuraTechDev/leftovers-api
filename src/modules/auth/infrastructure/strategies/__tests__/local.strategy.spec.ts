import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Role, Provider } from '@prisma/client';
import { LocalStrategy } from '../local.strategy';
import { ValidateUserUseCase } from '../../../application/use-cases/validate-user.use-case';
import { AuthUser } from '../../../domain/interfaces/user.interface';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let validateUserUseCase: jest.Mocked<ValidateUserUseCase>;

  const mockUser: AuthUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    provider: Provider.LOCAL,
    photoUrl: undefined,
    businessId: undefined,
  };

  beforeEach(async () => {
    const validateUserUseCaseMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: ValidateUserUseCase,
          useValue: validateUserUseCaseMock,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    validateUserUseCase = module.get(ValidateUserUseCase);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if validation is successful', async () => {
      validateUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await strategy.validate('test@example.com', 'password123');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(validateUserUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      validateUserUseCase.execute.mockResolvedValue(null);

      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(validateUserUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword',
      );
    });
  });
});
