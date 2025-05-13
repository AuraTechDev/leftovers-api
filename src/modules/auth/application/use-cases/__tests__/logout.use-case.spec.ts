/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from '../logout.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authRepository: jest.Mocked<AuthRepository>;

  beforeEach(async () => {
    const authRepositoryMock = {
      deleteRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: AuthRepository,
          useValue: authRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    authRepository = module.get(AuthRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete the refresh token', async () => {
      // Arrange
      const refreshToken = 'refresh-token-to-delete';
      authRepository.deleteRefreshToken.mockResolvedValue(undefined);

      // Act
      await useCase.execute(refreshToken);

      // Assert
      expect(authRepository.deleteRefreshToken).toHaveBeenCalledWith(
        refreshToken,
      );
    });
  });
});
