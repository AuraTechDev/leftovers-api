# Resend Module

This module provides a clean, reusable infrastructure provider for sending emails using the Resend API. It is designed to be used by other modules (such as invitations, auth, etc.) in a clean architecture codebase.

## Features
- Exports an `IEmailSender` interface for sending emails
- Uses the Resend API (API key required)
- Extensible options for email (add cc, bcc, attachments, etc.)
- No business logic or controllers—just infrastructure

## Setup
1. **Add your Resend API key to your `.env` file:**
   ```env
   RESEND_API_KEY=your-resend-api-key
   ```
2. **Ensure your `env.config.ts` includes `RESEND_API_KEY`**

3. **Import the ResendModule in your feature module:**
   ```ts
   import { ResendModule } from '../resend/resend.module';

   @Module({
     imports: [ResendModule],
     // ...
   })
   export class InvitationsModule {}
   ```

## Usage Example
Inject `IEmailSender` in your use-case or service and call `sendEmail`:

```ts
import { Inject, Injectable } from '@nestjs/common';
import { IEmailSender } from '../../resend/domain/interfaces/email-sender.interface';

@Injectable()
export class SendInvitationEmailUseCase {
  constructor(
    @Inject('IEmailSender') private readonly emailSender: IEmailSender
  ) {}

  async execute(to: string, link: string) {
    await this.emailSender.sendEmail({
      to,
      subject: 'Invitation',
      html: `<a href="${link}">Accept invitation</a>`,
    });
  }
}
```

## Extending Email Options
You can add more fields to the options object in `ResendService` (e.g., cc, bcc, attachments) as your needs grow.

## Integrating the Real API
Replace the placeholder in `ResendService.sendEmail` with your preferred HTTP client or the official Resend SDK.

---

**This module is infrastructure-only. All business logic for email content and when to send should live in your feature modules.** 