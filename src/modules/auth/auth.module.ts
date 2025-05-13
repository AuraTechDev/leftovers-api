import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { env } from '../../config/env.config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
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
} from './application/use-cases';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    LoginUseCase,
    RegisterUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    ValidateUserUseCase,
    OAuthLoginUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard, AuthRepository],
})
export class AuthModule {}
