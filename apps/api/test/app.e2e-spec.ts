import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/config/supabase.service';

// Mock SupabaseService — we only test auth guards (401 without token)
const mockSupabaseService = {
  getClient: () => ({
    auth: { getUser: async () => ({ data: { user: null }, error: new Error('mock') }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({ limit: async () => ({ data: [], error: null }) }),
        }),
      }),
    }),
  }),
  getClientForUser: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }) }),
      }),
    }),
  }),
};

describe('CONFORM+ API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(mockSupabaseService)
      .compile();

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

    // ─── Employee endpoints ─────────────────────────
    it('GET /api/v1/employees should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/employees')
        .expect(401);
    });

    it('GET /api/v1/employees/search should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/employees/search?q=dupont')
        .expect(401);
    });

    it('GET /api/v1/employees/stats should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/employees/stats')
        .expect(401);
    });

    it('POST /api/v1/employees should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/employees')
        .send({ nom: 'Test', prenom: 'User', date_entree: '2024-01-01' })
        .expect(401);
    });

    it('POST /api/v1/employees/import should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/employees/import')
        .expect(401);
    });

    it('PATCH /api/v1/employees/some-id should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/employees/some-id')
        .send({ poste: 'Technicien' })
        .expect(401);
    });

    it('DELETE /api/v1/employees/some-id should return 401 without token', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/employees/some-id')
        .expect(401);
    });

    // ─── Inspection endpoints ───────────────────────
    it('GET /api/v1/inspection/readiness should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/inspection/readiness')
        .expect(401);
    });

    // ─── Compliance cross-module endpoint ───────────
    it('GET /api/v1/compliance/evaluate-full should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/compliance/evaluate-full')
        .expect(401);
    });

    it('GET /api/v1/compliance/score should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/compliance/score')
        .expect(401);
    });

    it('PATCH /api/v1/compliance/alerts/some-id/resolve should return 401 without token', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/compliance/alerts/some-id/resolve')
        .expect(401);
    });

    // ─── EPI endpoints ──────────────────────────────
    it('GET /api/v1/epi/categories should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/epi/categories')
        .expect(401);
    });

    it('GET /api/v1/epi/items should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/epi/items')
        .expect(401);
    });

    // ─── Formation endpoints ────────────────────────
    it('GET /api/v1/formations/types should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/formations/types')
        .expect(401);
    });

    it('GET /api/v1/formations/conformite should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/formations/conformite')
        .expect(401);
    });

    // ─── Registre endpoints ─────────────────────────
    it('GET /api/v1/registres should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/registres')
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
