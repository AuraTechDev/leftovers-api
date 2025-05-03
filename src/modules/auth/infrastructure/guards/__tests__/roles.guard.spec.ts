import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockHttpContext: { getRequest: jest.Mock };

    beforeEach(() => {
      mockHttpContext = {
        getRequest: jest.fn(),
      };

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
      } as unknown as ExecutionContext;
    });

    it('should allow access when no roles are required', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should allow access when user has the required role', () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'superadmin@example.com',
          name: 'Super Admin User',
          role: Role.SUPER_ADMIN,
        },
      };

      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue([Role.SUPER_ADMIN]);

      mockHttpContext.getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have the required role', () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'user@example.com',
          name: 'Regular User',
          role: Role.USER,
        },
      };

      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue([Role.SUPER_ADMIN]);

      mockHttpContext.getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      const mockRequest = {};

      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue([Role.USER]);

      mockHttpContext.getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should allow access when user has one of the required roles', () => {
      const mockRequest = {
        user: {
          id: 1,
          email: 'superadmin@example.com',
          name: 'Super Admin User',
          role: Role.SUPER_ADMIN,
        },
      };

      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride');
      getAllAndOverrideSpy.mockReturnValue([Role.BUSINESS, Role.SUPER_ADMIN]);

      mockHttpContext.getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});
