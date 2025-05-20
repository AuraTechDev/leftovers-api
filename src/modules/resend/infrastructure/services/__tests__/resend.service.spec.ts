import { ResendService } from '../resend.service';

describe('ResendService', () => {
  let service: ResendService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-api-key';
    process.env.RESEND_API_URL = 'https://api.resend.com/emails';
    service = new ResendService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send email successfully', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;
    await expect(
      service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      })
    ).resolves.toBeUndefined();
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should throw on failed send', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: async () => 'Bad Request',
    }) as any;
    await expect(
      service.sendEmail({
        to: 'fail@example.com',
        subject: 'Fail',
        html: '<p>Fail</p>',
      })
    ).rejects.toThrow('Resend API error: Bad Request');
    expect(global.fetch).toHaveBeenCalled();
  });
}); 