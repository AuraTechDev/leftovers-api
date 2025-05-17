import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { authConfig } from '../../../../config/auth.config';
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokensUseCase,
  LogoutUseCase,
  OAuthLoginUseCase,
} from '../../application/use-cases';
import { LoginDto, RegisterDto } from '../dtos';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly oAuthLoginUseCase: OAuthLoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.registerUseCase.execute(registerDto);
      return this.generateAuthResponse(result);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const result = await this.loginUseCase.execute({
      email: loginDto.email,
      userId: req.user.id,
    });
    return this.generateAuthResponse(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      const result = await this.refreshTokensUseCase.execute({
        refreshToken: body.refreshToken,
      });
      return this.generateAuthResponse(result);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    await this.logoutUseCase.execute({
      userId: req.user.id,
    });
    return { success: true };
  }

  // Google OAuth Routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates Google OAuth flow
    // The guard handles the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  // Apple OAuth Routes
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  appleAuth() {
    // This route initiates Apple OAuth flow
  }

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthCallback(@Req() req, @Res() res: Response) {
    return this.handleOAuthCallback(req, res);
  }

  // Helper methods
  private async handleOAuthCallback(req, res: Response) {
    try {
      const result = await this.oAuthLoginUseCase.execute({
        userId: req.user.id,
      });
      
      // For OAuth flows, typically redirect with tokens as query params or cookies
      if (authConfig.security.cookieSecure) {
        res.cookie('access_token', result.accessToken, {
          httpOnly: authConfig.security.cookieHttpOnly,
          secure: authConfig.security.cookieSecure,
          sameSite: authConfig.security.cookieSameSite,
          maxAge: authConfig.jwt.accessTokenExpiresIn,
        });
        res.cookie('refresh_token', result.refreshToken, {
          httpOnly: authConfig.security.cookieHttpOnly,
          secure: authConfig.security.cookieSecure,
          sameSite: authConfig.security.cookieSameSite,
          maxAge: authConfig.jwt.refreshTokenExpiresIn,
        });
      }
      
      res.redirect(authConfig.redirects.success);
    } catch (error) {
      res.redirect(authConfig.redirects.failure);
    }
  }
}
