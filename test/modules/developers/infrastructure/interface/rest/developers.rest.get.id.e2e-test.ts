import { NestExpressApplication } from '@nestjs/platform-express';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
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
import { DeveloperComparator } from './utils/developer.comparator';
import { DeveloperRestCreator } from './utils/developer.rest.creator';
import { DeveloperRestFinder } from './utils/developer.rest.finder';

describe('Developer Rest API GET /developers/:id', () => {
  let app: NestExpressApplication;
  let restCreator: DeveloperRestCreator;
  let restFinder: DeveloperRestFinder;
  let developerComparator: DeveloperComparator;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new DeveloperRestCreator(app);
    restFinder = new DeveloperRestFinder(app);
    developerComparator = new DeveloperComparator();
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should find an existing developer by id', async () => {
    const developer = await createTestDeveloper();

    const response = await findExistingDeveloper(developer.id);

    expectToReturnStatusCode(200, response);
    expectToReturnCreatedDeveloper(response, developer);
  });

  it('should retrieve only the required fields with fields query param', async () => {
    const developer = await createTestDeveloper();
    const fields = ['name', 'email'];

    const response = await findDeveloperWithOnlySomeFields(
      developer.id,
      fields,
    );

    expectToReturnStatusCode(200, response);
    expectToReturnOnlyRequestedFields(response, developer, fields);
  });

  it('should retrieve only the required fields with serialized fields', async () => {
    const developer = await createTestDeveloper();
    const fields = ['name', 'email'];

    const response = await findDeveloperWithOnlySomeFieldsInSerializedFormat(
      developer.id,
      fields,
    );

    expectToReturnStatusCode(200, response);
    expectToReturnOnlyRequestedFields(response, developer, fields);
  });

  it('should throw 400 on invalid field on fields query param', async () => {
    const developer = await createTestDeveloper();
    const fields = ['name', 'unkown-field'];

    const response = await findDeveloperWithOnlySomeFields(
      developer.id,
      fields,
    );

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidFieldError(response);
  });

  it('should throw 404 on non existing developer', async () => {
    const nonExistingDeveloperId = DeveloperId.create().value();

    const response = await findExistingDeveloper(nonExistingDeveloperId);

    expectToReturnStatusCode(404, response);
    expectToReturnNotFoundReason(response, nonExistingDeveloperId);
  });

  async function createTestDeveloper(): Promise<DeveloperWithPrimitives> {
    const result = await restCreator.create(1);
    return result[0].response.body;
  }

  async function findExistingDeveloper(id: string): Promise<request.Response> {
    return restFinder.findById(id);
  }

  async function findDeveloperWithOnlySomeFields(
    id: string,
    fields: string[],
  ): Promise<request.Response> {
    return request(app.getHttpServer())
      .get(`/developers/${id}`)
      .query({ fields });
  }

  async function findDeveloperWithOnlySomeFieldsInSerializedFormat(
    id: string,
    fields: string[],
  ): Promise<request.Response> {
    return request(app.getHttpServer()).get(
      `/developers/${id}?fields=${JSON.stringify(fields)}`,
    );
  }

  function expectToReturnCreatedDeveloper(
    response: request.Response,
    developer: DeveloperWithPrimitives,
  ): void {
    const returnedDeveloper = response.body;
    expect(returnedDeveloper).toBeDefined();

    expect(
      developerComparator.areEquals(developer, returnedDeveloper),
    ).toBeTruthy();
  }

  function expectToReturnOnlyRequestedFields(
    response: request.Response,
    developer: DeveloperWithPrimitives,
    fields: string[],
  ): void {
    const returnedDeveloper = response.body;
    expect(Object.keys(returnedDeveloper).length).toBe(fields.length);

    for (const field of fields) {
      expect(returnedDeveloper[field]).toBe(developer[field]);
    }
  }

  function expectToReturnInvalidFieldError(response: request.Response): void {
    expectToReturnError(
      response,
      'Bad Request',
      'Invalid field has been found in fields param',
    );
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
