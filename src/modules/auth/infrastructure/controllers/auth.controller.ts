import { Body, Controller, Get, Post, UseGuards, Patch } from '@nestjs/common';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { GetUser } from '../decorators/get-user.decorator';
import { AuthUser } from '../../domain/interfaces/user.interface';
import { UpdateProfileDto } from '../../application/dtos/update-profile.dto';
import { ChangePasswordDto } from '../../application/dtos/change-password.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { AppleAuthGuard } from '../guards/apple-auth.guard';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-tokens.use-case';
import { OAuthLoginUseCase } from '../../application/use-cases/oauth-login.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.registerUseCase.execute(registerDto);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@GetUser() currentUser: AuthUser) {
    return this.loginUseCase.execute(currentUser);
  }

  @Post('refresh')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.refreshTokensUseCase.execute(refreshTokenDto.refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(@GetUser() currentUser: AuthUser) {
    return this.oauthLoginUseCase.execute(currentUser);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  appleAuth() {
    // Authentication flow is handled in the strategy
  }

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  appleAuthCallback(@GetUser() currentUser: AuthUser) {
    return this.oauthLoginUseCase.execute(currentUser);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() currentUser: AuthUser) {
    return currentUser;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @GetUser() currentUser: AuthUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute(currentUser.id, updateProfileDto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @GetUser() currentUser: AuthUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute(
      currentUser.id,
      changePasswordDto,
    );
  }
}
