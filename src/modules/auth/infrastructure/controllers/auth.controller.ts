import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../application/services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  // Rutas para gestión de usuarios (solo para administradores)
  @Get('admin')
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getAdminContent() {
    return { message: 'Solo disponible para administradores' };
  }

  @Get('business')
  @Roles(Role.BUSINESS, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getBusinessContent() {
    return { message: 'Solo disponible para business y super admin' };
  }

  // Rutas de OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // El flujo de autenticación se maneja en la estrategia
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  appleAuth() {
    // El flujo de autenticación se maneja en la estrategia
  }

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  appleAuthCallback(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }
}
