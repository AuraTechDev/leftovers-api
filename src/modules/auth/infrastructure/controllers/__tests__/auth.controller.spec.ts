import { Test, TestingModule } from '@nestjs/testing';
import { Role, Provider } from '@prisma/client';
import { AuthController } from '../../controllers/auth.controller';
import { AuthUser } from '../../../domain/interfaces/user.interface';
import { RegisterDto } from '../../dto/register.dto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { UpdateProfileDto } from '../../dto/update-profile.dto';
import { ChangePasswordDto } from '../../dto/change-password.dto';
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  OAuthLoginUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
} from '../../../application/use-cases';
import {
  AuthResponseDto,
  UserDto,
} from '../../../application/dtos/auth-response.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';

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

  const mockUser: AuthUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    provider: Provider.LOCAL,
    photoUrl: 'test-photo-url',
  };

  // For register responses where Prisma model expects string | null
  const mockRegisterResponse: AuthResponseDto = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      photoUrl: mockUser.photoUrl,
      provider: mockUser.provider,
      businessId: undefined,
    },
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
  };

  // Create a mock login response that matches expected type
  const mockLoginResponse: AuthResponseDto = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      photoUrl: mockUser.photoUrl,
      provider: mockUser.provider,
      businessId: undefined,
    },
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
  };

  const mockRefreshResponse = {
    accessToken: 'new-test-token',
    refreshToken: 'new-test-refresh-token',
  };

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
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      const mockResult = {
        user: {
          id: 'user-123',
          email: 'new@example.com',
          name: 'New User',
          roles: [Role.USER],
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900, // 15 minutes in seconds
      };

      registerUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.register(registerDto);

      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        user: {
          id: mockResult.user.id,
          email: mockResult.user.email,
          name: mockResult.user.name,
          roles: mockResult.user.roles,
        },
        accessToken: mockResult.accessToken,
        refreshToken: mockResult.refreshToken,
        expiresIn: mockResult.expiresIn,
      });
    });

    it('should throw BadRequestException when registration fails', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      };

      registerUseCase.execute.mockRejectedValue(new Error('Email already in use'));

      await expect(controller.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const req = { user: mockUser } as RequestWithUser;
      const loginDto = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const mockResult = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          roles: [mockUser.role],
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 900, // 15 minutes in seconds
      };

      loginUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.login(req, loginDto);

      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: loginDto.email,
        userId: req.user.id,
      });
      expect(result).toEqual({
        user: {
          id: mockResult.user.id,
          email: mockResult.user.email,
          name: mockResult.user.name,
          roles: mockResult.user.roles,
        },
        accessToken: mockResult.accessToken,
        refreshToken: mockResult.refreshToken,
        expiresIn: mockResult.expiresIn,
      });
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
    it('should logout a user successfully', async () => {
      const req = {
        user: {
          id: 'user-123',
        },
      };

      logoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(logoutUseCase.execute).toHaveBeenCalledWith({
        userId: req.user.id,
      });
      expect(result).toEqual({ success: true });
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
    it('should handle Google callback and redirect with success', async () => {
      const req = {
        user: {
          id: 'user-123',
        },
      } as RequestWithUser;
      const res = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const mockResult = {
        user: {
          id: 'user-123',
          email: 'user@gmail.com',
        },
        accessToken: 'oauth-access-token',
        refreshToken: 'oauth-refresh-token',
      };

      oauthLoginUseCase.execute.mockResolvedValue(mockResult);

      await controller.googleAuthCallback(req, res);

      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith({
        userId: req.user.id,
      });
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should handle Apple callback and redirect with success', async () => {
      const req = {
        user: {
          id: 'user-123',
        },
      } as RequestWithUser;
      const res = {
        redirect: jest.fn(),
        cookie: jest.fn(),
      } as unknown as Response;

      const mockResult = {
        user: {
          id: 'user-123',
          email: 'user@icloud.com',
        },
        accessToken: 'oauth-access-token',
        refreshToken: 'oauth-refresh-token',
      };

      oauthLoginUseCase.execute.mockResolvedValue(mockResult);

      await controller.appleAuthCallback(req, res);

      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith({
        userId: req.user.id,
      });
      expect(res.redirect).toHaveBeenCalled();
    });

    it('should redirect to failure page when OAuth login fails', async () => {
      const req = {
        user: {
          id: 'user-123',
        },
      } as RequestWithUser;
      const res = {
        redirect: jest.fn(),
      } as unknown as Response;

      oauthLoginUseCase.execute.mockRejectedValue(new Error('OAuth login failed'));

      await controller.googleAuthCallback(req, res);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('failure'));
    });
  });

  describe('updateProfile', () => {
    it('should update the user profile', async () => {
      const req = { user: mockUser } as RequestWithUser;
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        photoUrl: 'https://updated-photo-url.com',
      };

      const updatedUser: UserDto = {
        id: mockUser.id,
        name: updateProfileDto.name!,
        email: updateProfileDto.email!,
        photoUrl: updateProfileDto.photoUrl,
        role: mockUser.role,
        provider: mockUser.provider,
        businessId: undefined,
      };

      updateProfileUseCase.execute.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(req.user, updateProfileDto);

      expect(updateProfileUseCase.execute).toHaveBeenCalledWith(
        mockUser.id,
        updateProfileDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should change the user password', async () => {
      const req = { user: mockUser } as RequestWithUser;
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'current-password',
        newPassword: 'new-password',
      };

      changePasswordUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        req.user,
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
