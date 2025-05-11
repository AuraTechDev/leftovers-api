import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../jwt.strategy';
import { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user object from jwt payload', () => {
      // Mock JWT payload
      const payload = {
        sub: 1,
        email: 'test@example.com',
        role: Role.USER,
      };

      // Expected user info returned by validate
      const expectedResult = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Call validate and check result
      const result = strategy.validate(payload);
      expect(result).toEqual(expectedResult);
    });

    it('should return a super admin user object from jwt payload', () => {
      // Mock JWT payload for admin
      const payload = {
        sub: 2,
        email: 'admin@example.com',
        role: Role.SUPER_ADMIN,
      };

      // Expected user info returned by validate
      const expectedResult = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Call validate and check result
      const result = strategy.validate(payload);
      expect(result).toEqual(expectedResult);
    });

    it('should return a business user object from jwt payload', () => {
      // Mock JWT payload for business
      const payload = {
        sub: 3,
        email: 'business@example.com',
        role: Role.BUSINESS,
      };

      // Expected user info returned by validate
      const expectedResult = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Call validate and check result
      const result = strategy.validate(payload);
      expect(result).toEqual(expectedResult);
    });
  });
});
