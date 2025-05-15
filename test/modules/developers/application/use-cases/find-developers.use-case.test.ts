import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { DeveloperName } from 'src/modules/developers/domain/value-objects/developer.name';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import {
  Criteria,
  Filters,
} from 'src/shared/persistence/domain/criteria/criteria';
import { Limit } from 'src/shared/persistence/domain/criteria/limit';
import { Offset } from 'src/shared/persistence/domain/criteria/offset';
import { Order } from 'src/shared/persistence/domain/criteria/order';
import { OrderField } from 'src/shared/persistence/domain/criteria/order.field';
import { OrderType } from 'src/shared/persistence/domain/criteria/order.type';
import { Pagination } from 'src/shared/persistence/domain/criteria/pagination';
import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { LimitMother } from 'test/shared/persistence/domain/criteria/limit.mother';
import { OffsetMother } from 'test/shared/persistence/domain/criteria/offset.mother';
import { DeveloperFilterQuery } from '../../../../../src/modules/developers/application/dtos/developer.filter.query';
import { DevelopersPaginatedList } from '../../../../../src/modules/developers/application/dtos/developers.paginated-list';
import { FindDevelopersUseCase } from '../../../../../src/modules/developers/application/use-cases/find-developers.use-case';
import { Developer } from '../../../../../src/modules/developers/domain/entities/developer';
import { DeveloperMother } from '../../domain/entities/developer.mother';
import { DeveloperRepositoryMock } from '../../infrastructure/persistence/mock/developer.repository.mock';

describe('FindDevelopersUseCase', () => {
  let useCase: FindDevelopersUseCase;
  let repository: DeveloperRepository;
  let validLimit: Limit;
  let validOffset: Offset;
  let validFindResult: Developer[];

  beforeEach(() => {
    repository = new DeveloperRepositoryMock();
    useCase = new FindDevelopersUseCase(repository);
    validLimit = LimitMother.random();
    validOffset = OffsetMother.random();
    validFindResult = [DeveloperMother.random(), DeveloperMother.random()];
  });

  it('should find developers without filtering', async () => {
    mockDatasourceToRetrieveDevelopers();

    const result = await useCase.run(validLimit, validOffset);

    expectToReturnDatasourceDevelopers(result);
    expectToBuildCriteriaWithInputValues();
  });

  it('should add default pagination if none is given', async () => {
    mockDatasourceToRetrieveDevelopers();

    await useCase.run();

    expectToBuildCriteriaWithDefaultValues();
  });

  it('should transform filter to datasource filter', async () => {
    mockDatasourceToRetrieveDevelopers();
    const filter = new DeveloperFilterQuery(new DeveloperName('John'));

    await useCase.run(validLimit, validOffset, filter);

    expectToBuildCriteriaWithFilter(filter);
  });

  function mockDatasourceToRetrieveDevelopers() {
    repository.find = jest.fn().mockResolvedValue(validFindResult);
    repository.count = jest
      .fn()
      .mockResolvedValue(new CountResult(validFindResult.length));
  }

  function expectToReturnDatasourceDevelopers(
    result: DevelopersPaginatedList,
  ): void {
    expect(result).toBeDefined();
    expect(result.total).toBe(validFindResult.length);
    let index = 0;
    for (const item of result.items) {
      expect(item).toEqual(validFindResult[index].toPrimitives());
      index++;
    }
  }

  function expectToBuildCriteriaWithDefaultValues(): void {
    expectToBuildCorrectCriteria([], Limit.default(), Offset.zero());
  }

  function expectToBuildCriteriaWithInputValues(): void {
    expectToBuildCorrectCriteria([], validLimit, validOffset);
  }

  function expectToBuildCriteriaWithFilter(filter: DeveloperFilterQuery): void {
    expectToBuildCorrectCriteria(
      [
        new EqualCondition(
          new ConditionField('name'),
          new ConditionValue(filter.name.value()),
        ),
      ],
      validLimit,
      validOffset,
    );
  }

  function expectToBuildCorrectCriteria(
    filters: Filters,
    limit: Limit,
    offset: Offset,
  ): void {
    const criteria = new Criteria(
      filters,
      new Order(new OrderField('id'), OrderType.asc()),
      new Pagination(limit, offset),
    );
    expect(repository.find).toHaveBeenCalledWith(criteria);
    expect(repository.count).toHaveBeenCalledWith(filters);
  }
});
