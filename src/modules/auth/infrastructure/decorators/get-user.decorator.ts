import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../../domain/interfaces/user.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
}

export const GetUser = createParamDecorator(
  (
    propertyKey: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return propertyKey ? user[propertyKey] : user;
  },
);
