import { NestExpressApplication } from '@nestjs/platform-express';
import { ApplicationHealthWithPrimitives } from 'src/server/health/domain/value-objects/application.health';
import * as request from 'supertest';
import { expectToReturnStatusCode } from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { DataSource } from 'typeorm';

describe('Health Rest API GET /health', () => {
  let app: NestExpressApplication;
  let datasource: DataSource;

  beforeEach(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    datasource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should return 200 when the server is available', async () => {
    const response = await checkHealth();

    expectToReturnStatusCode(200, response);
    expectToReturnValidHealthDetails(response);
  });

  it('should return 500 when the database is unavailable', async () => {
    givenDatabaseIsDown();

    const response = await checkHealth();

    expectToReturnStatusCode(503, response);
    expectToReturnInvalidHealthDetails(response);
  });

  async function checkHealth(): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/health`);
  }

  function givenDatabaseIsDown(): void {
    jest
      .spyOn(datasource, 'query')
      .mockRejectedValue(new Error('Database disconnected'));
  }

  function expectToReturnValidHealthDetails(response: request.Response): void {
    expectToReturnHealthDetails(response, 'ok', 'up');
  }

  function expectToReturnInvalidHealthDetails(
    response: request.Response,
  ): void {
    expectToReturnHealthDetails(response, 'error', 'down');
  }

  function expectToReturnHealthDetails(
    response: request.Response,
    expectedStatus: 'ok' | 'error',
    expectedDatabaseStatus: 'up' | 'down',
  ): void {
    const applicationHealth: ApplicationHealthWithPrimitives = response.body;
    expect(applicationHealth.status).toBe(expectedStatus);
    expect(applicationHealth.details).toBeDefined();
    expect(applicationHealth.details?.['database']?.status).toBe(
      expectedDatabaseStatus,
    );
  }
});
