import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { ReportRepository } from 'src/modules/reports/domain/ports/report.repository';
import { ReportStatus } from 'src/modules/reports/domain/value-objects/report.status';
import { ReportTarget } from 'src/modules/reports/domain/value-objects/report.target';
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
import { ReportFilterQuery } from '../../../../../src/modules/reports/application/dtos/report.filter.query';
import { FindReportsUseCase } from '../../../../../src/modules/reports/application/use-cases/find-reports.use-case';
import { Report } from '../../../../../src/modules/reports/domain/entities/report';
import { ReportMother } from '../../domain/entities/report.mother';
import { ReportRepositoryMock } from '../../infrastructure/persistence/mock/report.repository.mock';

describe('FindReportsUseCase', () => {
  let useCase: FindReportsUseCase;
  let repository: ReportRepository;
  let validLimit: Limit;
  let validOffset: Offset;
  let validFindResult: Report[];

  beforeEach(() => {
    repository = new ReportRepositoryMock();
    useCase = new FindReportsUseCase(repository);
    validLimit = LimitMother.random();
    validOffset = OffsetMother.random();
    validFindResult = [ReportMother.random(), ReportMother.random()];
  });

  it('should find reports without filtering', async () => {
    mockDatasourceToRetrieveReports();

    const result = await useCase.run(validLimit, validOffset);

    expectToReturnDatasourceReports(result);
    expectToBuildCriteriaWithInputValues();
  });

  it('should add default pagination if none is given', async () => {
    mockDatasourceToRetrieveReports();

    await useCase.run();

    expectToBuildCriteriaWithDefaultValues();
  });

  it('should transform filter to datasource filter', async () => {
    mockDatasourceToRetrieveReports();

    const filter = new ReportFilterQuery(
      ReportTarget.developer(),
      ReportStatus.pending(),
      DeveloperId.create(),
    );

    await useCase.run(validLimit, validOffset, filter);

    expectToBuildCriteriaWithFilter(filter);
  });

  function mockDatasourceToRetrieveReports() {
    repository.find = jest.fn().mockResolvedValue(validFindResult);
    repository.count = jest
      .fn()
      .mockResolvedValue(new CountResult(validFindResult.length));
  }

  function expectToReturnDatasourceReports(result: any): void {
    expect(result.items).toHaveLength(validFindResult.length);
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

  function expectToBuildCriteriaWithFilter(filter: ReportFilterQuery): void {
    const filters: Filters = [
      new EqualCondition(
        new ConditionField('target'),
        new ConditionValue(filter.target.value()),
      ),
      new EqualCondition(
        new ConditionField('status'),
        new ConditionValue(filter.status.value()),
      ),
      new EqualCondition(
        new ConditionField('developerId'),
        new ConditionValue(filter.developerId.value()),
      ),
    ];

    expectToBuildCorrectCriteria(filters, validLimit, validOffset);
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
