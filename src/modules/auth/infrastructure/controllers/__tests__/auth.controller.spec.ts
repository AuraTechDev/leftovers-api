/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../controllers/auth.controller';
import { AuthUser } from '../../../domain/interfaces/user.interface';
import { RegisterDto } from '../../../application/dtos/register.dto';
import { RefreshTokenDto } from '../../../application/dtos/refresh-token.dto';
import { UpdateProfileDto } from '../../../application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../../../application/dtos/change-password.dto';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { RefreshTokensUseCase } from '../../../application/use-cases/refresh-tokens.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { OAuthLoginUseCase } from '../../../application/use-cases/oauth-login.use-case';
import { UpdateProfileUseCase } from '../../../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import { UserDto } from '../../../application/dtos/auth-response.dto';
import {
  mockAuthUser,
  mockRegisterResponse,
  mockLoginResponse,
  mockRefreshResponse,
  mockUpdatedUserDto,
} from '../../../__mocks__/auth.mocks';

// Create RequestWithUser interface
interface RequestWithUser extends Request {
  user: AuthUser;
}

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let refreshTokensUseCase: jest.Mocked<RefreshTokensUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let oauthLoginUseCase: jest.Mocked<OAuthLoginUseCase>;
  let updateProfileUseCase: jest.Mocked<UpdateProfileUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;

  const mockUser: AuthUser = mockAuthUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RegisterUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RefreshTokensUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LogoutUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: OAuthLoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateProfileUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ChangePasswordUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    registerUseCase = module.get(RegisterUseCase);
    refreshTokensUseCase = module.get(RefreshTokensUseCase);
    logoutUseCase = module.get(LogoutUseCase);
    oauthLoginUseCase = module.get(OAuthLoginUseCase);
    updateProfileUseCase = module.get(UpdateProfileUseCase);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      registerUseCase.execute.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(registerDto);

      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResponse);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const req = { user: mockUser } as RequestWithUser;

      loginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(req.user);

      expect(loginUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'test-refresh-token',
      };

      refreshTokensUseCase.execute.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refreshTokens(refreshTokenDto);

      expect(refreshTokensUseCase.execute).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockRefreshResponse);
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'test-refresh-token',
      };

      logoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.logout(refreshTokenDto);

      expect(logoutUseCase.execute).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const req = { user: mockUser } as RequestWithUser;

      const result = controller.getProfile(req.user);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getAdminContent', () => {
    it('should return admin content', () => {
      const result = controller.getAdminContent();

      expect(result).toEqual({
        message: 'Solo disponible para administradores',
      });
    });
  });

  describe('getBusinessContent', () => {
    it('should return business content', () => {
      const result = controller.getBusinessContent();

      expect(result).toEqual({
        message: 'Solo disponible para business y super admin',
      });
    });
  });

  describe('OAuth callbacks', () => {
    it('should login a user after Google authentication', async () => {
      const req = { user: mockUser } as RequestWithUser;

      oauthLoginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const result = await controller.googleAuthCallback(req.user);

      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should login a user after Apple authentication', async () => {
      const req = { user: mockUser } as RequestWithUser;

      oauthLoginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const result = await controller.appleAuthCallback(req.user);

      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        photoUrl: 'https://updated-photo-url.com',
      };

      // Mocked response from service with required User properties
      const updatedUser: UserDto = mockUpdatedUserDto;

      updateProfileUseCase.execute.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        mockUser.id,
        updateProfileDto,
      );

      expect(updateProfileUseCase.execute).toHaveBeenCalledWith(
        mockUser.id,
        updateProfileDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should change the user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      changePasswordUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        mockUser.id,
        changePasswordDto,
      );

      expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
      );
      expect(result).toEqual(undefined);
    });
  });
});
