import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUser } from '../../domain/interfaces/user.interface';

interface RequestWithUser extends Request {
  user: AuthUser;
}

/**
 * Decorator that extracts the authenticated user from the request.
 * Can be used to get either the entire user object or a specific property.
 *
 * @param propertyKey - Optional key of the user property to extract
 * @returns The user object or the specified user property
 * @throws UnauthorizedException if no user is found in the request
 */
export const GetUser = createParamDecorator(
  (
    propertyKey: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No authenticated user found in request');
    }

    if (propertyKey) {
      if (!(propertyKey in user)) {
        throw new Error(
          `Property "${propertyKey}" does not exist on user object`,
        );
      }
      return user[propertyKey];
    }

    return user;
  },
);
