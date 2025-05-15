import { NestExpressApplication } from '@nestjs/platform-express';
import 'aws-sdk-client-mock-jest';
import * as request from 'supertest';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { CreateReportRequest } from '../../../../../../src/modules/reports/infrastructure/interface/rest/dtos/create.report.request';
import { ReportRestCreator } from './utils/report.rest.creator';
import { ReportRestFinder } from './utils/report.rest.finder';

describe('Report Rest API POST /reports', () => {
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

  it('should create a report', async () => {
    const { report, response } = await createWithCorrectParams();

    expectToReturnStatusCode(201, response);
    expectToReturnCreatedInstance(response, report);
    await expectToCorrectlyStoredInDatasource(response);
  });

  it('should throw 400 on missing input params', async () => {
    const response = await createWithTargetMissing();

    expectToReturnStatusCode(400, response);
    expectToReturnMissingTargetReason(response);
  });

  it('should throw 400 on invalid input param constraint', async () => {
    const response = await createWithInvalidTarget();

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidTargetReason(response);
  });

  async function createWithCorrectParams(): Promise<{
    report: CreateReportRequest;
    response: request.Response;
  }> {
    const result = await restCreator.create(1);
    return { report: result[0].body, response: result[0].response };
  }

  async function createWithTargetMissing(): Promise<request.Response> {
    return request(app.getHttpServer())
      .post('/reports')
      .send({
        targetId: {
          developerId: '123e4567-e89b-12d3-a456-426614174000',
        },
      });
  }

  async function createWithInvalidTarget(): Promise<request.Response> {
    return request(app.getHttpServer())
      .post('/reports')
      .send({
        target: 'invalid-target',
        targetId: {
          developerId: '123e4567-e89b-12d3-a456-426614174000',
        },
        startDate: '2024-12-23T08:30:22.362Z',
        endDate: '2025-02-03T17:39:33.443Z',
      });
  }

  function expectToReturnCreatedInstance(
    response: request.Response,
    report: CreateReportRequest,
  ): void {
    const body = response.body;
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    for (const fieldName of Object.keys(report)) {
      expect(body[fieldName]).toEqual(report[fieldName]);
    }
  }

  async function expectToCorrectlyStoredInDatasource(
    response: request.Response,
  ): Promise<void> {
    const createdReport = response.body;
    const reportId = createdReport?.id;
    const findResponse = await restFinder.findById(reportId);
    const foundReport = findResponse.body;

    expect(findResponse.statusCode).toBe(200);
    for (const fieldName in createdReport) {
      if (Object.prototype.hasOwnProperty.call(createdReport, fieldName)) {
        const fieldValue = createdReport[fieldName];
        expect(foundReport[fieldName]).toEqual(fieldValue);
      }
    }
  }

  function expectToReturnMissingTargetReason(response: request.Response): void {
    expectToReturnError(response, 'Bad Request', 'target should not be empty');
  }

  function expectToReturnInvalidTargetReason(response: request.Response): void {
    expectToReturnError(
      response,
      'Bad Request',
      'target must be one of the following values: developer',
    );
  }
});
