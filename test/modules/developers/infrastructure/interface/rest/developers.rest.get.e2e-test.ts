import { NestExpressApplication } from '@nestjs/platform-express';
import { DeveloperWithPrimitives } from 'src/modules/developers/domain/entities/developer';
import * as request from 'supertest';
import {
  expectToReturnError,
  expectToReturnStatusCode,
} from 'test/shared/core/infrastructure/rest/request.test.utils';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { AppTestModuleFactory } from 'test/utils/test.app.module.factory';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { DevelopersFindFilter } from '../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/developers.find.filter';
import { DeveloperComparator } from './utils/developer.comparator';
import { DeveloperRestCreator } from './utils/developer.rest.creator';

describe('Developer Rest API GET /developers', () => {
  let app: NestExpressApplication;
  let restCreator: DeveloperRestCreator;
  let developerComparator: DeveloperComparator;

  beforeAll(async () => {
    app = await new TestAppInitializer(new AppTestModuleFactory()).getApp();
    restCreator = new DeveloperRestCreator(app);
    developerComparator = new DeveloperComparator();
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
    await TestStateReseter.purgeQueues(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should find existing developers with correct instances and count', async () => {
    const developers = await createTestDevelopers();

    const response = await findAllDevelopers();

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectDevelopers(response, developers);
    expectToReturnCorrectTotalOf(developers.length, response);
  });

  it('should filter correctly the results with nested where encoding', async () => {
    const developers = await createTestDevelopers();
    const filter = { email: developers[0].email };

    const response = await findDeveloperWithFilter(filter);

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectDevelopers(response, [developers[0]]);
    expectToReturnCorrectTotalOf(1, response);
  });

  it('should filter correctly the results with serialized encoding', async () => {
    const developers = await createTestDevelopers();
    const filter = { email: developers[0].email };

    const response =
      await findDeveloperWithFilterWithSerializedEncoding(filter);

    expectToReturnStatusCode(200, response);
    expectToReturnCorrectDevelopers(response, [developers[0]]);
    expectToReturnCorrectTotalOf(1, response);
  });

  it('should paginate correctly the results', async () => {
    const developers = await createTestDevelopers();
    const idSortedDevelopers = developers.sort((developerA, developerB) =>
      developerA.id.localeCompare(developerB.id),
    );

    const firstPageResponse = await findDeveloperWithPagination(0, 1);
    const secondPageResponse = await findDeveloperWithPagination(1, 1);
    const emptyPageResponse = await findDeveloperWithPagination(2, 1);

    expectToReturnCorrectPaginatedResponse(firstPageResponse, 2, [
      idSortedDevelopers[0],
    ]);
    expectToReturnCorrectPaginatedResponse(secondPageResponse, 2, [
      idSortedDevelopers[1],
    ]);
    expectToReturnCorrectPaginatedResponse(emptyPageResponse, 2, []);
  });

  it('should throw 400 on invalid field on fields query param', async () => {
    const response = await findDeveloperWithPagination(
      'first' as unknown as number,
      20,
    );

    expectToReturnStatusCode(400, response);
    expectToReturnInvalidFieldError(response);
  });

  async function createTestDevelopers(): Promise<DeveloperWithPrimitives[]> {
    const results = await restCreator.create(2);
    return results.map((result) => result.response.body);
  }

  async function findAllDevelopers(): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/developers`);
  }

  async function findDeveloperWithFilter(
    where: DevelopersFindFilter,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).get(`/developers`).query({ where });
  }

  async function findDeveloperWithFilterWithSerializedEncoding(
    where: DevelopersFindFilter,
  ): Promise<request.Response> {
    return request(app.getHttpServer()).get(
      `/developers?where=${JSON.stringify(where)}`,
    );
  }

  async function findDeveloperWithPagination(
    offset: number,
    limit: number,
  ): Promise<request.Response> {
    return request(app.getHttpServer())
      .get(`/developers`)
      .query({ limit, offset });
  }

  function expectToReturnCorrectDevelopers(
    response: request.Response,
    developers: DeveloperWithPrimitives[],
  ): void {
    const returnedDevelopers: DeveloperWithPrimitives[] = response.body?.items;
    expect(returnedDevelopers).toBeDefined();
    expect(returnedDevelopers.length).toBe(developers.length);

    for (const developer of developers) {
      const returnedDeveloper = returnedDevelopers.find(
        (returnDeveloper) => returnDeveloper.id === developer.id,
      );
      expect(returnedDeveloper).toBeDefined();
      expect(
        developerComparator.areEquals(developer, returnedDeveloper),
      ).toBeTruthy();
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
    developersToMatch: DeveloperWithPrimitives[],
  ): void {
    expectToReturnStatusCode(200, response);
    expectToReturnCorrectTotalOf(total, response);
    expectToReturnCorrectDevelopers(response, developersToMatch);
  }

  function expectToReturnInvalidFieldError(response: request.Response): void {
    expectToReturnError(
      response,
      'Bad Request',
      'Value must be a number. Found: NaN',
    );
  }
});
