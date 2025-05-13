import { Provider, Role } from '@prisma/client';

export class UserDto {
  id: number;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  provider: Provider;
  businessId?: number;
}

export class AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken: string;

  static create(
    user: UserDto,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    const response = new AuthResponseDto();
    response.user = user;
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
    return response;
  }
}

export class TokensResponseDto {
  accessToken: string;
  refreshToken: string;

  static create(accessToken: string, refreshToken: string): TokensResponseDto {
    const response = new TokensResponseDto();
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
    return response;
  }
}
