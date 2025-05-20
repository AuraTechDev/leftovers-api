import { ResendService } from '../resend.service';

describe('ResendService', () => {
  let service: ResendService;

  beforeEach(() => {
    service = new ResendService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should implement sendEmail and log the email options', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const emailOptions = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
      text: 'Hello',
      from: 'noreply@example.com',
    };
    await service.sendEmail(emailOptions);
    expect(spy).toHaveBeenCalledWith('Sending email via Resend:', emailOptions);
    spy.mockRestore();
  });
}); 