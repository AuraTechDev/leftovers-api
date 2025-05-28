import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { env } from '../../config/env.config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AppleStrategy } from './infrastructure/strategies/apple.strategy';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case';
import { ValidateUserUseCase } from './application/use-cases/validate-user.use-case';
import { OAuthLoginUseCase } from './application/use-cases/oauth-login.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ValidateOAuthUserUseCase } from './application/use-cases/validate-oauth-user.use-case';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_EXPIRATION_TIME,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    LoginUseCase,
    RegisterUseCase,
    RefreshTokensUseCase,
    ValidateUserUseCase,
    OAuthLoginUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    ValidateOAuthUserUseCase,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    RolesGuard,
  ],
  exports: [RolesGuard, AuthRepository],
})
export class AuthModule {}
