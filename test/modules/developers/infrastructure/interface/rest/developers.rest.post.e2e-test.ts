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
import { CreateDeveloperRequest } from '../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/create.developer.request';
import { DeveloperRestCreator } from './utils/developer.rest.creator';
import { DeveloperRestFinder } from './utils/developer.rest.finder';

describe('Developer Rest API POST /developers', () => {
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

  it('should create a developer', async () => {
    const { developer, response } = await createWithCorrectParams();

    expectToReturnStatusCode(201, response);
    expectToReturnCreatedInstance(response, developer);
    await expectToCorrectlyStoredInDatasource(response);
  });

  it('should throw 400 on missing input params', async () => {
    const response = await createWithEmailMissing();

    expectToReturnStatusCode(400, response);
    expectToReturnMissingEmailReason(response);
  });

  it('should throw 400 on invalid input param constraint', async () => {
    const response = await createWithInvalidEmail();

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidEmailReason(response);
  });

  it('should throw 400 on duplicated email creation', async () => {
    const { developer } = await createWithCorrectParams();
    const response = await createWithSameEmailAsCreated(developer);

    expectToReturnStatusCode(400, response);
    expectToReturnDuplicatedEmailError(response, developer);
  });

  async function createWithCorrectParams(): Promise<{
    developer: CreateDeveloperRequest;
    response: request.Response;
  }> {
    const result = await restCreator.create(1);
    return { developer: result[0].body, response: result[0].response };
  }

  async function createWithEmailMissing(): Promise<request.Response> {
    return request(app.getHttpServer())
      .post('/developers')
      .send({ name: 'John', lastName: 'Doe' });
  }

  async function createWithInvalidEmail(): Promise<request.Response> {
    return request(app.getHttpServer()).post('/developers').send({
      name: 'John',
      lastName: 'Doe',
      email: 'john',
    });
  }

  async function createWithSameEmailAsCreated(
    createdDeveloper: CreateDeveloperRequest,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).post('/developers').send({
      name: 'John',
      lastName: 'Doe',
      email: createdDeveloper.email,
    });
  }

  function expectToReturnCreatedInstance(
    response: request.Response,
    developer: CreateDeveloperRequest,
  ): void {
    const body = response.body;
    expect(body).toBeDefined();
    expect(body.id).toBeDefined();
    for (const fieldName of Object.keys(developer)) {
      expect(body[fieldName]).toEqual(developer[fieldName]);
    }
  }

  async function expectToCorrectlyStoredInDatasource(
    response: request.Response,
  ): Promise<void> {
    const createdDeveloper = response.body;
    const developerId = createdDeveloper?.id;
    const findResponse = await restFinder.findById(developerId);
    const foundDeveloper = findResponse.body;

    expect(findResponse.statusCode).toBe(200);
    for (const fieldName in createdDeveloper) {
      if (Object.prototype.hasOwnProperty.call(createdDeveloper, fieldName)) {
        const fieldValue = createdDeveloper[fieldName];
        expect(foundDeveloper[fieldName]).toEqual(fieldValue);
      }
    }
  }

  function expectToReturnMissingEmailReason(response: request.Response): void {
    expectToReturnError(response, 'Bad Request', 'email should not be empty');
  }

  function expectToReturnInvalidEmailReason(response: request.Response): void {
    expectToReturnError(response, 'Bad Request', 'email must be an email');
  }

  function expectToReturnDuplicatedEmailError(
    response: request.Response,
    createdDeveloper: CreateDeveloperRequest,
  ): void {
    expectToReturnError(
      response,
      'Bad Request',
      `Already exists an instance for the given email ${createdDeveloper.email}`,
    );
  }
});
