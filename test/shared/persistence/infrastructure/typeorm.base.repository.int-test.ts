import { NestExpressApplication } from '@nestjs/platform-express';
import { Uuid } from 'src/shared/core/domain/value-object/uuid';
import { ConditionField } from 'src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionIdentifier } from 'src/shared/persistence/domain/criteria/conditions/condition.identifier';
import { ConditionValue } from 'src/shared/persistence/domain/criteria/conditions/condition.value';
import { AndCondition } from 'src/shared/persistence/domain/criteria/conditions/logical-conditions/and.condition';
import { OrCondition } from 'src/shared/persistence/domain/criteria/conditions/logical-conditions/or.condition';
import { ContainsCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/contains.condition';
import { EqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { NotEqualCondition } from 'src/shared/persistence/domain/criteria/conditions/operators/not.equal.filter';
import {
  Criteria,
  Filters,
} from 'src/shared/persistence/domain/criteria/criteria';
import { Order } from 'src/shared/persistence/domain/criteria/order';
import { OrderField } from 'src/shared/persistence/domain/criteria/order.field';
import { OrderType } from 'src/shared/persistence/domain/criteria/order.type';
import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { IntegrationTestModuleFactory } from 'test/utils/integration.test.app.module.factory';
import { TestAppDestroyer } from 'test/utils/test.app.destroyer';
import { TestAppInitializer } from 'test/utils/test.app.initializer';
import { TestStateReseter } from 'test/utils/test.state.reseter';
import { DataSource, Repository } from 'typeorm';
import { TypeORMMockEntity } from './typeorm.mock-entity';
import { TypeORMMockAggregateRoot } from './typeorm.mock.aggregate.root';
import { TypeORMMockRepository } from './typeorm.mock.repository';

describe('TypeORMBaseRepository', () => {
  let typeORMRepository: Repository<TypeORMMockEntity>;
  let repository: TypeORMMockRepository;
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await new TestAppInitializer(
      new IntegrationTestModuleFactory(),
    ).getApp();
    const dataSource = app.get<DataSource>(DataSource);
    typeORMRepository = dataSource.getRepository(TypeORMMockEntity);
    repository = new TypeORMMockRepository(typeORMRepository);
  });

  beforeEach(async () => {
    await TestStateReseter.resetDatabase(app);
  });

  afterAll(async () => {
    await new TestAppDestroyer().destroyApp(app);
  });

  it('should create an instance', async () => {
    const instance = TypeORMMockAggregateRoot.random();
    expect(await repository.save(instance)).toBeFalsy();
  });

  it('should find a single instance with array of conditions', async () => {
    const created = await createSingleInstance();

    const found = await findInstanceById(created.id);

    expect(created.equals(found)).toBeTruthy();
  });

  it('should find a single instance with logical condition', async () => {
    const created = await createSingleInstance();

    const found = await findInstanceByIdWithLogicalCondition(created.id);

    expect(created.equals(found)).toBeTruthy();
  });

  it('should return null when no instance can be found', async () => {
    const fakeId = Uuid.create().value();

    const found = await findInstanceById(fakeId);

    expect(found).toBeNull();
  });

  it('should find multiple instances', async () => {
    const created = await createTestInstances(2);
    const filters = buildContainsFiltersBy('email', created);
    const orderBy = 'email';

    const found = await findInstances(filters, orderBy);

    expectToContainSameInstances(found, created, orderBy);
  });

  it('should find multiple instances with complex filtering', async () => {
    const created = await createTestInstances(5);
    const { filter, expectedInstances } =
      buildComplexFilterForInstances(created);
    const orderBy = 'email';

    const found = await findInstances(filter, orderBy);

    expectToContainSameInstances(found, expectedInstances, orderBy);
  });

  it('should count instances', async () => {
    const itemsToCreate = 10;
    await createTestInstances(itemsToCreate);

    const count = await countInstances([]);

    expect(count.value()).toBe(itemsToCreate);
  });

  it('should count instances with filtering', async () => {
    const itemsToCreate = 10;
    const created = await createTestInstances(itemsToCreate);

    const count = await countInstancesWithIdFilter(created[0].id);

    expect(count.value()).toBe(1);
  });

  it('should delete an instance', async () => {
    const created = await createSingleInstance();

    await repository.delete(created);

    expect(await findInstanceById(created.id)).toBeNull();
    await expectToNotCountInstance(created.id);
    await expectToNotFindInstance(created.id);
  });

  async function createSingleInstance(): Promise<TypeORMMockAggregateRoot> {
    const instances = await createTestInstances(1);
    return instances[0];
  }

  async function findInstanceById(
    id: string,
  ): Promise<TypeORMMockAggregateRoot> {
    return await repository.findOne([
      new EqualCondition(new ConditionField('id'), new ConditionValue(id)),
    ]);
  }

  async function findInstanceByIdWithLogicalCondition(
    id: string,
  ): Promise<TypeORMMockAggregateRoot> {
    return await repository.findOne(
      new AndCondition([
        new EqualCondition(new ConditionField('id'), new ConditionValue(id)),
      ]),
    );
  }

  async function countInstancesWithIdFilter(id: string): Promise<CountResult> {
    return await repository.count(
      new AndCondition([
        new EqualCondition(new ConditionField('id'), new ConditionValue(id)),
      ]),
    );
  }

  async function countInstances(filters: Filters): Promise<CountResult> {
    return await repository.count(filters);
  }

  async function findInstances(
    filters: Filters,
    orderBy: string,
  ): Promise<TypeORMMockAggregateRoot[]> {
    return repository.find(
      new Criteria(
        filters,
        new Order(new OrderField(orderBy), OrderType.asc()),
      ),
    );
  }

  async function createTestInstances(
    count: number,
  ): Promise<TypeORMMockAggregateRoot[]> {
    const instances: TypeORMMockAggregateRoot[] = [];
    for (let index = 0; index < count; index++) {
      const instance = TypeORMMockAggregateRoot.random();
      instances.push(instance);
      await repository.save(instance);
    }
    return instances;
  }

  function buildContainsFiltersBy(
    field: string,
    instances: TypeORMMockAggregateRoot[],
  ): Filters {
    const conditions = [];
    for (const instance of instances) {
      conditions.push(new ConditionValue(instance[field]));
    }
    return [new ContainsCondition(new ConditionField(field), conditions)];
  }

  function buildComplexFilterForInstances(
    instances: TypeORMMockAggregateRoot[],
  ): { filter: Filters; expectedInstances: TypeORMMockAggregateRoot[] } {
    const firstInstanceId = instances[0].id;
    const secondInstanceName = instances[1].name;
    const secondInstanceLastName = instances[1].lastName;
    const thirdInstanceEmail = instances[2].email;
    const fourthInstanceEmail = instances[3].email;
    const fifthInstanceEmail = instances[4].email;
    const fifthInstanceId = instances[4].id;
    const filter = new OrCondition([
      new EqualCondition(
        new ConditionField('id'),
        new ConditionValue(firstInstanceId),
      ),
      new AndCondition([
        new EqualCondition(
          new ConditionField('name'),
          new ConditionValue(secondInstanceName),
        ),
        new EqualCondition(
          new ConditionField('lastName'),
          new ConditionValue(secondInstanceLastName),
        ),
      ]),
      new AndCondition([
        new ContainsCondition(new ConditionField('email'), [
          new ConditionValue(thirdInstanceEmail),
          new ConditionValue(fourthInstanceEmail),
          new ConditionValue(fifthInstanceEmail),
        ]),
        new NotEqualCondition(
          new ConditionField('id'),
          new ConditionValue(fifthInstanceId),
          new ConditionIdentifier('id2'),
        ),
      ]),
    ]);

    return {
      filter,
      expectedInstances: [
        instances[0],
        instances[1],
        instances[2],
        instances[3],
      ],
    };
  }

  function expectToContainSameInstances(
    found: TypeORMMockAggregateRoot[],
    expected: TypeORMMockAggregateRoot[],
    orderBy: string,
  ): void {
    const orderedExpectedInstances = expected.sort((instanceA, instanceB) =>
      instanceA[orderBy].localeCompare(instanceB[orderBy]),
    );

    expect(found.length).toBe(expected.length);
    let index = 0;
    for (const instance of found) {
      expect(instance.equals(orderedExpectedInstances[index])).toBeTruthy();
      index++;
    }
  }

  async function expectToNotCountInstance(id: string): Promise<void> {
    const countResult = await countInstances([
      new EqualCondition(new ConditionField('id'), new ConditionValue(id)),
    ]);
    expect(countResult.value()).toBe(0);
  }

  async function expectToNotFindInstance(id: string): Promise<void> {
    const result = await findInstances(
      [new EqualCondition(new ConditionField('id'), new ConditionValue(id))],
      'id',
    );
    expect(result.length).toBe(0);
  }
});
