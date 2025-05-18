import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Req,
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

// Define the request type with a user property
interface RequestWithUser extends Request {
  user: {
    id: number;
    role: Role;
  };
}

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
    @Req() req: RequestWithUser,
  ) {
    return this.sendInvitationUseCase.execute(sendInvitationDto, req.user.id);
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
    @Req() req: RequestWithUser,
  ) {
    await this.resendInvitationUseCase.execute(id, req.user.id);
    return { message: 'Invitation resent successfully' };
  }
}
