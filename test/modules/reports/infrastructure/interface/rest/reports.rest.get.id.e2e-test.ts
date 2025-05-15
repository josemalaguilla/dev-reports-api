import { NestExpressApplication } from '@nestjs/platform-express';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
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
import { ReportComparator } from './utils/report.comparator';
import { ReportRestCreator } from './utils/report.rest.creator';
import { ReportRestFinder } from './utils/report.rest.finder';

describe('Report Rest API GET /reports/:id', () => {
  let app: NestExpressApplication;
  let restCreator: ReportRestCreator;
  let restFinder: ReportRestFinder;
  let reportComparator: ReportComparator;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new ReportRestCreator(app);
    restFinder = new ReportRestFinder(app);
    reportComparator = new ReportComparator();
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should find an existing report by id', async () => {
    const report = await createTestReport();

    const response = await findExistingReport(report.id);

    expectToReturnStatusCode(200, response);
    expectToReturnCreatedReport(response, report);
  });

  it('should throw 404 on non existing report', async () => {
    const nonExistingReportId = ReportId.create().value();

    const response = await findExistingReport(nonExistingReportId);

    expectToReturnStatusCode(404, response);
    expectToReturnNotFoundReason(response, nonExistingReportId);
  });

  async function createTestReport(): Promise<ReportWithPrimitives> {
    const result = await restCreator.create(1);
    return result[0].response.body;
  }

  async function findExistingReport(id: string): Promise<request.Response> {
    return restFinder.findById(id);
  }

  function expectToReturnCreatedReport(
    response: request.Response,
    report: ReportWithPrimitives,
  ): void {
    const returnedReport = response.body;
    expect(returnedReport).toBeDefined();

    expect(reportComparator.areEquals(report, returnedReport)).toBeTruthy();
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
