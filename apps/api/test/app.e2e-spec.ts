import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CONFORM+ API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('should respond to root', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(404); // No root handler, just confirms API is up
    });
  });

  describe('Auth Guard', () => {
    it('GET /api/v1/companies should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/companies')
        .expect(401);
    });

    it('GET /api/v1/dashboard should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/dashboard')
        .expect(401);
    });

    it('GET /api/v1/duerps should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/duerps')
        .expect(401);
    });

    it('GET /api/v1/compliance/alerts should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/compliance/alerts')
        .expect(401);
    });

    it('GET /api/v1/audit-logs should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .expect(401);
    });

    it('POST /api/v1/compliance/evaluate should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/compliance/evaluate')
        .send({ company_id: 'test' })
        .expect(401);
    });
  });

  describe('Validation', () => {
    it('POST /api/v1/companies should reject invalid body without auth', () => {
      return request(app.getHttpServer())
        .post('/api/v1/companies')
        .send({})
        .expect(401);
    });
  });
});
