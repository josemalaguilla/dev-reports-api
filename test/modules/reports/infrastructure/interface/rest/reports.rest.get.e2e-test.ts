import { NestExpressApplication } from '@nestjs/platform-express';
import { ReportWithPrimitives } from 'src/modules/reports/domain/entities/report';
import * as request from 'supertest';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { ReportsFindFilter } from '../../../../../../src/modules/reports/infrastructure/interface/rest/dtos/reports.find.filter';
import { ReportComparator } from './utils/report.comparator';
import { ReportRestCreator } from './utils/report.rest.creator';

describe('Report Rest API GET /reports', () => {
  let app: NestExpressApplication;
  let restCreator: ReportRestCreator;
  let reportComparator: ReportComparator;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new ReportRestCreator(app);
    reportComparator = new ReportComparator();
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should find existing reports with correct instances and count', async () => {
    const reports = await createTestReports();

    const response = await findAllReports();

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectReports(response, reports);
    expectToReturnCorrectTotalOf(reports.length, response);
  });

  it('should filter correctly the results with nested where encoding', async () => {
    const reports = await createTestReports();
    const filter = { developerId: reports[0].targetId.developerId };

    const response = await findReportWithFilter(filter);

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectReports(response, [reports[0]]);
    expectToReturnCorrectTotalOf(1, response);
  });

  it('should filter correctly the results with serialized encoding', async () => {
    const reports = await createTestReports();
    const filter = { developerId: reports[0].targetId.developerId };

    const response = await findReportWithFilterWithSerializedEncoding(filter);

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectReports(response, [reports[0]]);
    expectToReturnCorrectTotalOf(1, response);
  });

  it('should paginate correctly the results', async () => {
    const reports = await createTestReports();
    const idSortedReports = reports.sort((reportA, reportB) =>
      reportA.id.localeCompare(reportB.id),
    );

    const firstPageResponse = await findReportWithPagination(0, 1);
    const secondPageResponse = await findReportWithPagination(1, 1);
    const emptyPageResponse = await findReportWithPagination(2, 1);

    expectToReturnCorrectPaginatedResponse(firstPageResponse, 2, [
      idSortedReports[0],
    ]);
    expectToReturnCorrectPaginatedResponse(secondPageResponse, 2, [
      idSortedReports[1],
    ]);
    expectToReturnCorrectPaginatedResponse(emptyPageResponse, 2, []);
  });

  it('should throw 400 on invalid field on fields query param', async () => {
    const invalidFilter = { developerId: 'invalid-value' } as any;

    const response =
      await findReportWithFilterWithSerializedEncoding(invalidFilter);

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidFieldError(response);
  });

  async function createTestReports(): Promise<ReportWithPrimitives[]> {
    const results = await restCreator.create(2);
    return results.map((result) => result.response.body);
  }

  async function findAllReports(): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/reports`);
  }

  async function findReportWithFilter(
    where: ReportsFindFilter,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/reports`).query({ where });
  }

  async function findReportWithFilterWithSerializedEncoding(
    where: ReportsFindFilter,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).get(
      `/reports?where=${JSON.stringify(where)}`,
    );
  }

  async function findReportWithPagination(
    offset: number,
    limit: number,
  ): Promise<request.Response> {
    return request(app.getHttpServer())
      .get(`/reports`)
      .query({ limit, offset });
  }

  function expectToReturnCorrectReports(
    response: request.Response,
    reports: ReportWithPrimitives[],
  ): void {
    const returnedReports: ReportWithPrimitives[] = response.body?.items;
    expect(returnedReports).toBeDefined();
    expect(returnedReports.length).toBe(reports.length);

    for (const report of reports) {
      const returnedReport = returnedReports.find(
        (returnReport) => returnReport.id === report.id,
      );
      expect(returnedReport).toBeDefined();
      expect(reportComparator.areEquals(report, returnedReport)).toBeTruthy();
    }
  }

  function expectToReturnCorrectTotalOf(
    expectedTotal: number,
    response: request.Response,
  ): void {
    const returnedTotal = response.body?.total;
    expect(returnedTotal).toBe(expectedTotal);
  }

  function expectToReturnCorrectPaginatedResponse(
    response: request.Response,
    total: number,
    reportsToMatch: ReportWithPrimitives[],
  ): void {
    expectToReturnStatusCode(200, response);
    expectToReturnCorrectTotalOf(total, response);
    expectToReturnCorrectReports(response, reportsToMatch);
  }

  function expectToReturnInvalidFieldError(response: request.Response): void {
    expectToReturnError(
      response,
      'Bad Request',
      'The uuid invalid-value is not valid',
    );
  }
});
