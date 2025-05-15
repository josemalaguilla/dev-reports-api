import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { DeveloperFields } from 'src/modules/developers/domain/value-objects/developer.fields';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { DeveloperRepositoryMock } from 'test/modules/developers/infrastructure/persistence/mock/developer.repository.mock';
import {
  FindOneDeveloperUseCase,
  ProjectedDeveloper,
} from '../../../../../src/modules/developers/application/use-cases/find-one-developer.use-case';
import { Developer } from '../../../../../src/modules/developers/domain/entities/developer';
import { DeveloperNotFoundError } from '../../../../../src/modules/developers/domain/errors/developer.not-found.error';
import { DeveloperMother } from '../../domain/entities/developer.mother';

describe('FindOneDeveloperUseCase', () => {
  let useCase: FindOneDeveloperUseCase;
  let repository: DeveloperRepository;
  let validResultingDeveloper: Developer;

  beforeEach(() => {
    repository = new DeveloperRepositoryMock();
    useCase = new FindOneDeveloperUseCase(repository);
    validResultingDeveloper = DeveloperMother.random();
  });

  it('should get a valid developer', async () => {
    mockDatasourceToFindValidDeveloper();

    const result = await useCase.run(validResultingDeveloper.id);

    expectToReturnValidDeveloper(result);
    expectToCallDatasourceWithTheCorrectFilter();
  });

  it('should get only the required fields when fields array is given', async () => {
    const fields = new DeveloperFields(['name', 'email']);
    mockDatasourceToFindValidDeveloper();

    const result = await useCase.run(validResultingDeveloper.id, fields);

    expectToReturnOnlyDesiredParamsFromDeveloper(result, fields);
    expectToCallDatasourceWithTheCorrectFilter();
  });

  it('should throw developer not found when developer not exists', async () => {
    mockDatasourceToNotFindAnyDeveloper();
    try {
      await useCase.run(validResultingDeveloper.id);
    } catch (error) {
      expectToThrowNotFoundError(error);
    }
  });

  function mockDatasourceToFindValidDeveloper(): void {
    repository.findOne = jest.fn().mockResolvedValue(validResultingDeveloper);
  }

  function mockDatasourceToNotFindAnyDeveloper(): void {
    repository.findOne = jest.fn().mockResolvedValue(null);
  }

  function expectToCallDatasourceWithTheCorrectFilter(): void {
    expect(repository.findOne).toHaveBeenCalledWith([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(validResultingDeveloper.id.value()),
      ),
    ]);
  }

  function expectToReturnValidDeveloper(result: ProjectedDeveloper): void {
    expect(validResultingDeveloper.toPrimitives()).toEqual(result);
  }

  function expectToReturnOnlyDesiredParamsFromDeveloper(
    result: ProjectedDeveloper,
    fields: DeveloperFields,
  ): void {
    expect(Object.keys(result).length).toBe(fields.length());
    const validDeveloperWithPrimitives = validResultingDeveloper.toPrimitives();
    for (const field of fields.value()) {
      expect(validDeveloperWithPrimitives[field]).toEqual(result[field]);
    }
  }

  function expectToThrowNotFoundError(error: Error) {
    expect(error).toBeInstanceOf(DeveloperNotFoundError);
  }
});
