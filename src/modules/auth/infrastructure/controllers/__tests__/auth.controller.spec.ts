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
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      registerUseCase.execute.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(registerDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(registerUseCase.execute).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResponse);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const req = { user: mockUser } as RequestWithUser;

      loginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(logoutUseCase.execute).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const req = { user: mockUser } as RequestWithUser;

      const result = controller.getProfile(req);

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

      const result = await controller.googleAuthCallback(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should login a user after Apple authentication', async () => {
      const req = { user: mockUser } as RequestWithUser;

      oauthLoginUseCase.execute.mockResolvedValue(mockLoginResponse);

      const result = await controller.appleAuthCallback(req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(oauthLoginUseCase.execute).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
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

      // Mocked response from service with required User properties
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

      const result = await controller.updateProfile(req, updateProfileDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
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

      const result = await controller.changePassword(req, changePasswordDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
      );
      expect(result).toEqual(undefined);
    });
  });
});
