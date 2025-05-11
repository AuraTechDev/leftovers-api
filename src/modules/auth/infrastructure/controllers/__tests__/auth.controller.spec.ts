import { Test, TestingModule } from '@nestjs/testing';
import { Role, Provider } from '@prisma/client';
import { AuthController } from '../auth.controller';
import { AuthService } from '../../../application/services/auth.service';
import { RegisterDto } from '../../dto/register.dto';
import { AuthUser } from '../../../domain/interfaces/user.interface';

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
    it('should login a user', () => {
      const req = { user: mockUser } as RequestWithUser;

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockReturnValue(mockLoginResponse);

      const result = controller.login(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
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
    it('should login a user after Google authentication', () => {
      const req = { user: mockUser } as RequestWithUser;

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockReturnValue(mockLoginResponse);

      const result = controller.googleAuthCallback(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should login a user after Apple authentication', () => {
      const req = { user: mockUser } as RequestWithUser;

      const loginSpy = jest.spyOn(authService, 'login');
      loginSpy.mockReturnValue(mockLoginResponse);

      const result = controller.appleAuthCallback(req);

      expect(loginSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });
});
