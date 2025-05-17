import { Module, DynamicModule, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { authConfig } from '../../config/auth.config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AppleStrategy } from './infrastructure/strategies/apple.strategy';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  ValidateUserUseCase,
  OAuthLoginUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
  ValidateOAuthUserUseCase,
} from './application/use-cases';

// Core providers that are always needed
const coreProviders = [
  AuthRepository,
  LoginUseCase,
  RegisterUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  ValidateUserUseCase,
  OAuthLoginUseCase,
  UpdateProfileUseCase,
  ChangePasswordUseCase,
  ValidateOAuthUserUseCase,
  LocalStrategy,
  JwtStrategy,
  RolesGuard,
];

// Conditionally enabled providers
const oauthProviders = [];

if (authConfig.providers.google.enabled) {
  oauthProviders.push(GoogleStrategy);
}

if (authConfig.providers.apple.enabled) {
  oauthProviders.push(AppleStrategy);
}

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: authConfig.jwt.secret,
      signOptions: {
        expiresIn: authConfig.jwt.accessTokenExpiresIn,
        audience: authConfig.jwt.audience,
        issuer: authConfig.jwt.issuer,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [...coreProviders, ...oauthProviders],
  exports: [RolesGuard, AuthRepository],
})
export class AuthModule {}
