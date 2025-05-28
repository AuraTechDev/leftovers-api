import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  type: 'access' | 'refresh';
  jti?: string; // JWT ID for refresh token rotation
  iat?: number;
  exp?: number;
}
