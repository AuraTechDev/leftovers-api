/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from '../login.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { AuthUser } from '../../../domain/interfaces/user.interface';
import { Provider, Role } from '@prisma/client';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const authRepositoryMock = {
      createRefreshToken: jest.fn(),
    };

    const jwtServiceMock = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should generate tokens for authenticated user', async () => {
      // Arrange
      const mockUser: AuthUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: Role.USER,
        provider: Provider.LOCAL,
      };

      authRepository.createRefreshToken.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue('test-jwt-token');

      // Act
      const result = await useCase.execute(mockUser);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toEqual(mockUser.id);
      expect(result.user.email).toEqual(mockUser.email);
      expect(result.accessToken).toEqual('test-jwt-token');
      expect(result.refreshToken).toBeDefined();

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(authRepository.createRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.any(Date),
      );
    });
  });
});
