import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', () => {
    const email = `test-${Date.now()}@example.com`; // Generate unique email
    
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'Password123!',
        name: 'E2E Test User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.user.email).toBe(email);
        
        // Save tokens for subsequent tests
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('should access protected route with valid token', () => {
    return request(app.getHttpServer())
      .get('/users/me') // Adjust to a protected route in your API
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('should refresh tokens', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        
        // Update tokens
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('should logout successfully', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({ success: true });
  });
}); 