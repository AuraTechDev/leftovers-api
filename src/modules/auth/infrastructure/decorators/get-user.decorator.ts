import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../domain/interfaces/user.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
