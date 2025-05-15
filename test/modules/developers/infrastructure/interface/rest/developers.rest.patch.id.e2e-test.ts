import { NestExpressApplication } from '@nestjs/platform-express';
import 'aws-sdk-client-mock-jest';
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
import { UpdateDeveloperRequest } from '../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/update.developer.request';
import { DeveloperComparator } from './utils/developer.comparator';
import { DeveloperRestCreator } from './utils/developer.rest.creator';
import { DeveloperRestFinder } from './utils/developer.rest.finder';

describe('Developer Rest API PATCH /developers/:id', () => {
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

  it('should update existing developer by id', async () => {
    const developer = await createTestDeveloper();
    const update = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.es',
    };

    const response = await updateDeveloper(developer.id, update);

    expectToReturnStatusCode(200, response);
    expectToReturnUpdatedDeveloper(response, developer, update);
    await expectToCorrectlyStoredInDatasource(developer.id, developer, update);
  });

  it('should throw 400 on invalid field on fields update param', async () => {
    const developer = await createTestDeveloper();
    const update = {
      email: 'test',
    };

    const response = await updateDeveloper(developer.id, update);

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidFieldError(response);
  });

  it('should throw 400 on updating email to existing email developer', async () => {
    const developer = await createTestDeveloper();
    const existingDeveloper = await createTestDeveloper();
    const update = {
      email: existingDeveloper.email,
    };

    const response = await updateDeveloper(developer.id, update);

    expectToReturnStatusCode(400, response);
    expectToReturnDuplicateEmailError(response);
  });

  it('should throw 404 on non existing developer', async () => {
    const nonExistingDeveloperId = DeveloperId.create().value();
    const update = { name: 'Test' };

    const response = await updateDeveloper(nonExistingDeveloperId, update);

    expectToReturnStatusCode(404, response);
    expectToReturnNotFoundReason(response, nonExistingDeveloperId);
  });

  async function createTestDeveloper(): Promise<DeveloperWithPrimitives> {
    const result = await restCreator.create(1);
    return result[0].response.body;
  }

  async function updateDeveloper(
    id: string,
    update: UpdateDeveloperRequest,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).patch(`/developers/${id}`).send(update);
  }

  function expectToReturnUpdatedDeveloper(
    response: request.Response,
    developer: DeveloperWithPrimitives,
    update: UpdateDeveloperRequest,
  ): void {
    const returnedDeveloper = response.body;
    expect(returnedDeveloper).toBeDefined();

    const expectedDeveloperData = { ...developer, ...update };
    expect(
      developerComparator.areEquals(expectedDeveloperData, returnedDeveloper),
    ).toBeTruthy();
  }

  async function expectToCorrectlyStoredInDatasource(
    id: string,
    developer: DeveloperWithPrimitives,
    update: UpdateDeveloperRequest,
  ): Promise<void> {
    const findResponse = await restFinder.findById(id);
    const foundDeveloper = findResponse.body;
    const expectedDeveloperData = { ...developer, ...update };

    for (const fieldName in expectedDeveloperData) {
      if (
        Object.prototype.hasOwnProperty.call(expectedDeveloperData, fieldName)
      ) {
        const fieldValue = expectedDeveloperData[fieldName];
        expect(foundDeveloper[fieldName]).toEqual(fieldValue);
      }
    }
  }

  function expectToReturnInvalidFieldError(response: request.Response): void {
    expectToReturnError(response, 'Bad Request', 'email must be an email');
  }

  function expectToReturnDuplicateEmailError(response: request.Response): void {
    expectToReturnError(
      response,
      'Bad Request',
      'Already exists an instance for the given email',
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
