import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SendInvitationDto } from '../dto/send-invitation.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { SendInvitationUseCase } from '../../application/use-cases/send-invitation.use-case';
import { ValidateInvitationUseCase } from '../../application/use-cases/validate-invitation.use-case';
import { AcceptInvitationUseCase } from '../../application/use-cases/accept-invitation.use-case';
import { ResendInvitationUseCase } from '../../application/use-cases/resend-invitation.use-case';
import { GetUser } from '../../../auth/infrastructure/decorators/get-user.decorator';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly sendInvitationUseCase: SendInvitationUseCase,
    private readonly validateInvitationUseCase: ValidateInvitationUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly resendInvitationUseCase: ResendInvitationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async sendInvitation(
    @Body() sendInvitationDto: SendInvitationDto,
    @GetUser() currentUser: AuthUser,
  ) {
    return this.sendInvitationUseCase.execute(
      sendInvitationDto,
      currentUser.id,
    );
  }

  @Get('validate')
  async validateInvitation(@Query('token') token: string) {
    return this.validateInvitationUseCase.execute(token);
  }

  @Post('accept')
  async acceptInvitation(@Body() acceptInvitationDto: AcceptInvitationDto) {
    return this.acceptInvitationUseCase.execute(acceptInvitationDto);
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async resendInvitation(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() currentUser: AuthUser,
  ) {
    await this.resendInvitationUseCase.execute(id, currentUser.id);
    return { message: 'Invitation resent successfully' };
  }
}
