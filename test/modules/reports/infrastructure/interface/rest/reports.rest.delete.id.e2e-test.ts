import { NestExpressApplication } from '@nestjs/platform-express';
import 'aws-sdk-client-mock-jest';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
import { ReportDeletedAt } from 'src/modules/reports/domain/value-objects/report.deleted.at';
import { ReportId } from 'src/modules/reports/domain/value-objects/report.id';
import * as request from 'supertest';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { ReportRestCreator } from './utils/report.rest.creator';
import { ReportRestFinder } from './utils/report.rest.finder';

describe('Report Rest API DELETE /reports/:id', () => {
  let app: NestExpressApplication;
  let restCreator: ReportRestCreator;
  let restFinder: ReportRestFinder;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new ReportRestCreator(app);
    restFinder = new ReportRestFinder(app);
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should delete an existing report by id', async () => {
    const report = await createTestReport();
    const expectedDeletedAt = ReportDeletedAt.now();
    mockDeletedAtToReturnTheSameFixedDate(expectedDeletedAt);

    const response = await deleteExistingReport(report.id);

    expectToReturnStatusCode(200, response);
    await expectToNotFindReportInDatasource(report.id);
  });

  it('should throw 400 on invalid report id', async () => {
    const invalidReportId = 'test-123';

    const response = await deleteExistingReport(invalidReportId);

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidIdError(response, invalidReportId);
  });

  it('should throw 404 on non existing report', async () => {
    const nonExistingReportId = ReportId.create().value();

    const response = await deleteExistingReport(nonExistingReportId);

    expectToReturnStatusCode(404, response);
    expectToReturnNotFoundReason(response, nonExistingReportId);
  });

  async function createTestReport(): Promise<ReportWithPrimitives> {
    const result = await restCreator.create(1);
    return result[0].response.body;
  }

  function mockDeletedAtToReturnTheSameFixedDate(
    fixedDate: ReportDeletedAt,
  ): void {
    jest.spyOn(ReportDeletedAt, 'now').mockReturnValue(fixedDate);
  }

  async function deleteExistingReport(id: string): Promise<request.Response> {
    return request(app.getHttpServer()).delete(`/reports/${id}`);
  }

  async function expectToNotFindReportInDatasource(id: string): Promise<void> {
    const findByIdResponse = await restFinder.findById(id);
    expect(findByIdResponse.statusCode).toBe(404);
  }

  function expectToReturnInvalidIdError(
    response: request.Response,
    id: string,
  ): void {
    expectToReturnError(response, 'Bad Request', `The uuid ${id} is not valid`);
  }

  function expectToReturnNotFoundReason(
    response: request.Response,
    reportId: string,
  ): void {
    expectToReturnError(
      response,
      'Not Found',
      `Report with id ${reportId} not found`,
    );
  }
});
