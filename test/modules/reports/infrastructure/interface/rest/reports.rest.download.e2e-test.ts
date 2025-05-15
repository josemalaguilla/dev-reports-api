import { NestExpressApplication } from '@nestjs/platform-express';
import 'aws-sdk-client-mock-jest';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
import { REPORT_SYMBOLS } from 'src/modules/reports/reports.symbols';
import * as request from 'supertest';
import { DeveloperRestCreator } from 'test/modules/developers/infrastructure/interface/rest/utils/developer.rest.creator';
import { ReportTargetMother } from 'test/modules/reports/domain/value-objects/report.target.mother';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { ConsumersHandler } from 'test/utils/consumers.handler';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { ReportRestCreator } from './utils/report.rest.creator';

describe('Report Rest API GET /reports/:id/download', () => {
  let app: NestExpressApplication;
  let reportCreator: ReportRestCreator;
  let developerCreator: DeveloperRestCreator;
  let consumerHandler: ConsumersHandler;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    reportCreator = new ReportRestCreator(app);
    developerCreator = new DeveloperRestCreator(app);
    consumerHandler = new ConsumersHandler(app);
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should download a generated report', async () => {
    consumerHandler.startConsumer(REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE);
    const { developer, report } = await createDeveloperReport();
    await waitForReportGeneration();
    consumerHandler.stopConsumer(REPORT_SYMBOLS.REPORT_DOMAIN_EVENTS_MESSAGE);

    const downloadResponse = await downloadReport(report.id);

    expectToReturnStatusCode(200, downloadResponse);
    expectResponseToBeFile(downloadResponse);
    expectToHaveValidReportContent(downloadResponse, developer);
  });

  it('should throw 400 when report has not been generated yet', async () => {
    const { report } = await createDeveloperReport();

    const downloadResponse = await downloadReport(report.id);

    expectToReturnStatusCode(404, downloadResponse);
    expectToReturnReportNotGenerated(downloadResponse);
  });

  async function createDeveloperReport(): Promise<{
    developer: DeveloperWithPrimitives;
    report: ReportWithPrimitives;
  }> {
    const developer = await createDeveloper();
    const report = await createReportForDeveloper(developer.id);
    return { developer, report };
  }

  async function createDeveloper(): Promise<DeveloperWithPrimitives> {
    const result = await developerCreator.create(1);
    return result[0].response.body;
  }

  async function createReportForDeveloper(
    developerId: string,
  ): Promise<ReportWithPrimitives> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
    const response = await reportCreator.createWithBody({
      target: ReportTargetMother.random().value(),
      targetId: {
        developerId,
      },
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
    return response.body;
  }

  function waitForReportGeneration() {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }

  async function downloadReport(reportId: string): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/reports/${reportId}/download`);
  }

  function expectResponseToBeFile(response: request.Response): void {
    const headers = response.headers;
    expect(headers['content-disposition']).toContain(`attachment; filename=`);
    expect(headers['content-type']).toBe('application/json');
  }

  function expectToHaveValidReportContent(
    response: request.Response,
    createdDeveloper: DeveloperWithPrimitives,
  ): void {
    const reportContent = response.body;
    expect(reportContent.name).toBe(createdDeveloper.name);
    expect(reportContent.email).toBe(createdDeveloper.email);
  }

  function expectToReturnReportNotGenerated(response: request.Response): void {
    expectToReturnError(response, 'Not Found', 'it has not been generated');
  }
});
