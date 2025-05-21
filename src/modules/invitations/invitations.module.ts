import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResendModule } from '../resend/resend.module';
import { InvitationsController } from './infrastructure/controllers/invitations.controller';
import { InvitationsRepository } from './infrastructure/repositories/invitations.repository';
import { SendInvitationUseCase } from './application/use-cases/send-invitation.use-case';
import { ValidateInvitationUseCase } from './application/use-cases/validate-invitation.use-case';
import { AcceptInvitationUseCase } from './application/use-cases/accept-invitation.use-case';
import { ResendInvitationUseCase } from './application/use-cases/resend-invitation.use-case';
import { EmailService } from './infrastructure/services/email.service';

@Module({
  imports: [PrismaModule, ResendModule],
  controllers: [InvitationsController],
  providers: [
    InvitationsRepository,
    SendInvitationUseCase,
    ValidateInvitationUseCase,
    AcceptInvitationUseCase,
    ResendInvitationUseCase,
    EmailService,
  ],
  exports: [InvitationsRepository],
})
export class InvitationsModule {}
