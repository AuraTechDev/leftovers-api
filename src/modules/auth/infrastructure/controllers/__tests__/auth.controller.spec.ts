import { Test, TestingModule } from '@nestjs/testing';
import { Role, Provider } from '@prisma/client';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../../application/services/auth.service';
import { RegisterDto } from '../../dto/register.dto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { AuthUser } from '../../../domain/interfaces/user.interface';
import { UpdateProfileDto } from '../../dto/update-profile.dto';
import { ChangePasswordDto } from '../../dto/change-password.dto';

// Create RequestWithUser interface
interface RequestWithUser extends Request {
  user: AuthUser;
}

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: AuthUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    role: Role.USER,
    provider: Provider.LOCAL,
    photoUrl: 'test-photo-url',
  };

  // For register responses where Prisma model expects string | null
  const mockRegisterResponse = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      photoUrl: mockUser.photoUrl || null,
      provider: mockUser.provider,
      providerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accessToken: 'test-token',
    refreshToken: 'test-refresh-token',
  };

  // Create a mock login response that matches expected type
  const mockLoginResponse = {
    user: {
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
      photoUrl: mockUser.photoUrl,
      provider: mockUser.provider,
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
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateUser: jest.fn(),
            refreshTokens: jest.fn(),
            logout: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

      const registerSpy = jest.spyOn(authService, 'register');
      registerSpy.mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResponse);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const req = { user: mockUser } as RequestWithUser;

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'test-refresh-token',
      };

      const refreshTokensSpy = jest.spyOn(authService, 'refreshTokens');
      refreshTokensSpy.mockResolvedValue(mockRefreshResponse);

      const result = await controller.refreshTokens(refreshTokenDto);

      expect(refreshTokensSpy).toHaveBeenCalledWith(
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

      const logoutSpy = jest.spyOn(authService, 'logout');
      logoutSpy.mockResolvedValue(undefined);

      const result = await controller.logout(refreshTokenDto);

      expect(logoutSpy).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
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

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockResolvedValue(mockLoginResponse);

      const result = await controller.googleAuthCallback(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should login a user after Apple authentication', async () => {
      const req = { user: mockUser } as RequestWithUser;

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockResolvedValue(mockLoginResponse);

      const result = await controller.appleAuthCallback(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
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
      const updatedUser = {
        id: mockUser.id,
        name: updateProfileDto.name!,
        email: updateProfileDto.email!,
        photoUrl: updateProfileDto.photoUrl || null,
        role: mockUser.role,
        provider: mockUser.provider,
        providerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateProfileSpy = jest.spyOn(authService, 'updateProfile');
      updateProfileSpy.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(req, updateProfileDto);

      expect(updateProfileSpy).toHaveBeenCalledWith(
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

      const serviceResponse = {
        message: 'Contraseña actualizada exitosamente',
      };

      const changePasswordSpy = jest.spyOn(authService, 'changePassword');
      changePasswordSpy.mockResolvedValue(serviceResponse);

      const result = await controller.changePassword(req, changePasswordDto);

      expect(changePasswordSpy).toHaveBeenCalledWith(
        mockUser.id,
        changePasswordDto,
      );
      expect(result).toEqual(serviceResponse);
    });
  });
});
