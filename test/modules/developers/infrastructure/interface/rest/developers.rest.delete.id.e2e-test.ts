import { NestExpressApplication } from '@nestjs/platform-express';
import 'aws-sdk-client-mock-jest';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
import { DeveloperDeletedAt } from 'src/modules/developers/domain/value-objects/developer.deleted.at';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import * as request from 'supertest';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { DeveloperRestCreator } from './utils/developer.rest.creator';
import { DeveloperRestFinder } from './utils/developer.rest.finder';

describe('Developer Rest API DELETE /developers/:id', () => {
  let app: NestExpressApplication;
  let restCreator: DeveloperRestCreator;
  let restFinder: DeveloperRestFinder;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new DeveloperRestCreator(app);
    restFinder = new DeveloperRestFinder(app);
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should delete an existing developer by id', async () => {
    const developer = await createTestDeveloper();
    const expectedDeletedAt = DeveloperDeletedAt.now();
    mockDeletedAtToReturnTheSameFixedDate(expectedDeletedAt);

    const response = await deleteExistingDeveloper(developer.id);

    expectToReturnStatusCode(200, response);
    await expectToNotFindDeveloperInDatasource(developer.id, developer.email);
  });

  it('should throw 400 on invalid developer id', async () => {
    const invalidDeveloperId = 'test-123';

    const response = await deleteExistingDeveloper(invalidDeveloperId);

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidIdError(response, invalidDeveloperId);
  });

  it('should throw 404 on non existing developer', async () => {
    const nonExistingDeveloperId = DeveloperId.create().value();

    const response = await deleteExistingDeveloper(nonExistingDeveloperId);

    expectToReturnStatusCode(404, response);
    expectToReturnNotFoundReason(response, nonExistingDeveloperId);
  });

  async function createTestDeveloper(): Promise<DeveloperWithPrimitives> {
    const result = await restCreator.create(1);
    return result[0].response.body;
  }

  function mockDeletedAtToReturnTheSameFixedDate(
    fixedDate: DeveloperDeletedAt,
  ): void {
    jest.spyOn(DeveloperDeletedAt, 'now').mockReturnValue(fixedDate);
  }

  async function deleteExistingDeveloper(
    id: string,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).delete(`/developers/${id}`);
  }

  async function findDeveloperByEmail(
    email: string,
  ): Promise<request.Response> {
    return request(app.getHttpServer())
      .get(`/developers`)
      .query({ where: { email } });
  }

  async function expectToNotFindDeveloperInDatasource(
    id: string,
    email: string,
  ): Promise<void> {
    const findByIdResponse = await restFinder.findById(id);
    const findByEmailResponse = await findDeveloperByEmail(email);
    const findByEmailResponseBody = findByEmailResponse?.body;

    expect(findByIdResponse.statusCode).toBe(404);
    expect(findByEmailResponseBody?.total).toBe(0);
    expect(findByEmailResponseBody?.items?.length).toBe(0);
  }

  function expectToReturnInvalidIdError(
    response: request.Response,
    id: string,
  ): void {
    expectToReturnError(response, 'Bad Request', `The uuid ${id} is not valid`);
  }

  function expectToReturnNotFoundReason(
    response: request.Response,
    developerId: string,
  ): void {
    expectToReturnError(
      response,
      'Not Found',
      `Developer with id ${developerId} not found`,
    );
  }
});
