import { Primitives } from 'src/shared/core/domain/value-object/primitive.value.object';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Condition } from '../../../../../src/shared/persistence/domain/criteria/conditions/condition';
import { ConditionField } from '../../../../../src/shared/persistence/domain/criteria/conditions/condition.field';
import { ConditionValue } from '../../../../../src/shared/persistence/domain/criteria/conditions/condition.value';
import { AndCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/logical-conditions/and.condition';
import { OrCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/logical-conditions/or.condition';
import { ContainsCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/contains.condition';
import { EqualCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/equal.condition';
import { GreaterThanCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/greater.condition';
import { GreaterThanOrEqualCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/greater.equal.condition';
import { LowerThanOrEqualCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/lower.equal.filter';
import { LowerThanCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/lower.filter';
import { NotContainsCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/not.contains.filter';
import { NotEqualCondition } from '../../../../../src/shared/persistence/domain/criteria/conditions/operators/not.equal.filter';
import { Criteria } from '../../../../../src/shared/persistence/domain/criteria/criteria';
import { Order } from '../../../../../src/shared/persistence/domain/criteria/order';
import { OrderField } from '../../../../../src/shared/persistence/domain/criteria/order.field';
import { OrderType } from '../../../../../src/shared/persistence/domain/criteria/order.type';
import { TypeORMCriteriaMapper } from '../../../../../src/shared/persistence/infrastructure/typeorm/criteria/typeorm.criteria.mapper';
import { TypeORMQueryBuilderMock } from './mocks/typeorm.query.builder.mock';
jest.mock('typeorm');

describe('Criterial filtering test', () => {
  let mapper: TypeORMCriteriaMapper;
  let simpleOrderCriteria: Order;
  let queryBuilderMock: Partial<SelectQueryBuilder<ObjectLiteral>>;
  let subQueryBuilderMock: Partial<SelectQueryBuilder<ObjectLiteral>>;

  beforeEach(() => {
    mapper = new TypeORMCriteriaMapper();
    simpleOrderCriteria = new Order(new OrderField('id'), OrderType.asc());
    queryBuilderMock = new TypeORMQueryBuilderMock();
    subQueryBuilderMock = new TypeORMQueryBuilderMock();
    (Brackets as jest.Mock).mockImplementation((callback) => {
      callback(subQueryBuilderMock);
      return this;
    });
  });

  describe('Logical conditions', () => {
    it('should create valid AND statement for criteria with multiple AND conditions', () => {
      const criteria = new Criteria(
        getMultipleAndCondition(),
        simpleOrderCriteria,
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expectToContainPrimaryAndConditions(2);
      expectToContainPrimaryEqualsAndCondition('status', 0);
      expectToContainPrimaryEqualsAndCondition('oldStatus', 1);
    });

    it('should create valid OR statement for criteria with multiple OR conditions', () => {
      const criteria = new Criteria(
        getMultipleORCondition(),
        simpleOrderCriteria,
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expectToContainPrimaryORConditions(2);
      expectToContainPrimaryEqualsOrCondition('status', 0);
      expectToContainPrimaryEqualsOrCondition('oldStatus', 1);
    });

    it('should add implicit AND condition if no logical operator is given', () => {
      const criteria = new Criteria(
        [getBasicEqualsCondition('status')],
        simpleOrderCriteria,
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expectToContainPrimaryAndConditions(1);
      expectToContainPrimaryEqualsAndCondition('status', 0);
    });

    it('should not add any condition if the AND operator has no conditions', () => {
      const criteria = new Criteria(
        getEmptyAndCondition(),
        simpleOrderCriteria,
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expecToNotHaveAnyCondition();
    });

    it('should not add any condition if the OR operator has no conditions', () => {
      const criteria = new Criteria(getEmptyORCondition(), simpleOrderCriteria);

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expecToNotHaveAnyCondition();
    });

    it('should not add any condition if not given', () => {
      const criteria = new Criteria([], simpleOrderCriteria);

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expecToNotHaveAnyCondition();
    });

    it('should create valid statement for criteria with nested AND/OR conditions', () => {
      const criteria = new Criteria(
        getNestedMultipleConditions(),
        simpleOrderCriteria,
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expectToContainPrimaryORConditions(3);
      expectToContainPrimaryEqualsOrCondition('status', 0);
      expectToContainSecondaryAndConditions(3);
      expectToContainSecondaryEqualsAndCondition('payment', 0);
      expectToContainSecondaryEqualsAndCondition('oldStatus', 1);
      expectToContainSecondaryEqualsOrCondition('newStatus', 0);
      expectToContainSecondaryEqualsOrCondition('state', 1);
      expectToContainSecondaryEqualsOrCondition('currentStatus', 2);
      expectToContainSecondaryEqualsOrCondition('planStatus', 3);
    });
  });

  describe('Operands', () => {
    it('should create a valid equals condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(EqualCondition, '=');
    });

    it('should create a valid not equals condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(
        NotEqualCondition,
        '!=',
      );
    });

    it('should create a valid greater than condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(
        GreaterThanCondition,
        '>',
      );
    });

    it('should create a valid greater than or equal condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(
        GreaterThanOrEqualCondition,
        '>=',
      );
    });

    it('should create a valid lower than condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(
        LowerThanCondition,
        '<',
      );
    });

    it('should create a valid lower than or equal condition', () => {
      expectToCreateValidQueryWithBasicComparisonOperation(
        LowerThanOrEqualCondition,
        '<=',
      );
    });

    it('should create a valid contains condition', () => {
      expectToCreateValidQueryWithContainsComparisonOperation(
        ContainsCondition,
        'IN',
      );
    });

    it('should create a valid not contains condition', () => {
      expectToCreateValidQueryWithContainsComparisonOperation(
        NotContainsCondition,
        'NOT IN',
      );
    });
  });

  describe('Input validation', () => {
    it('should throw error if invalid condition is given', () => {
      const criteria = new Criteria(
        new AndCondition([
          new ConditionField('invalid') as unknown as Condition,
        ]),
        simpleOrderCriteria,
      );

      try {
        mapper.map(
          queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
          criteria,
        );
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain(`Unsupported condition`);
      }
    });
  });

  function getMultipleORCondition(): AndCondition {
    return new OrCondition([
      getBasicEqualsCondition('status'),
      getBasicEqualsCondition('oldStatus'),
    ]);
  }

  function getMultipleAndCondition(): AndCondition {
    return new AndCondition([
      getBasicEqualsCondition('status'),
      getBasicEqualsCondition('oldStatus'),
    ]);
  }

  function getNestedMultipleConditions(): OrCondition {
    return new OrCondition([
      getBasicEqualsCondition('status'),
      new AndCondition([
        getBasicEqualsCondition('payment'),
        getBasicEqualsCondition('oldStatus'),
        new OrCondition([
          getBasicEqualsCondition('newStatus'),
          getBasicEqualsCondition('state'),
        ]),
      ]),
      new OrCondition([
        getBasicEqualsCondition('currentStatus'),
        getBasicEqualsCondition('planStatus'),
      ]),
    ]);
  }

  function getEmptyAndCondition(): AndCondition {
    return new AndCondition([]);
  }

  function getEmptyORCondition(): AndCondition {
    return new OrCondition([]);
  }

  function getBasicEqualsCondition(field: string): EqualCondition {
    return new EqualCondition(
      new ConditionField(field),
      new ConditionValue('ACTIVE'),
    );
  }

  function expecToNotHaveAnyCondition(): void {
    expect(queryBuilderMock.andWhere).not.toHaveBeenCalled();
    expect(queryBuilderMock.orWhere).not.toHaveBeenCalled();
    expect(queryBuilderMock.where).not.toHaveBeenCalled();
  }

  function expectToContainPrimaryAndConditions(timesCalled: number): void {
    expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(timesCalled);
  }

  function expectToContainPrimaryORConditions(timesCalled: number): void {
    expect(queryBuilderMock.orWhere).toHaveBeenCalledTimes(timesCalled);
  }

  function expectToContainPrimaryEqualsAndCondition(
    field: string,
    mockCall: number = 0,
  ): void {
    expectToContainBasicOperandCondition(
      field,
      '=',
      'ACTIVE',
      queryBuilderMock.andWhere as jest.Mock,
      mockCall,
    );
  }

  function expectToContainPrimaryEqualsOrCondition(
    field: string,
    mockCall: number = 0,
  ): void {
    expectToContainBasicOperandCondition(
      field,
      '=',
      'ACTIVE',
      queryBuilderMock.orWhere as jest.Mock,
      mockCall,
    );
  }

  function expectToContainSecondaryAndConditions(timesCalled: number): void {
    expect(subQueryBuilderMock.andWhere).toHaveBeenCalledTimes(timesCalled);
  }

  function expectToContainSecondaryEqualsAndCondition(
    field: string,
    mockCall: number = 0,
  ): void {
    expectToContainBasicOperandCondition(
      field,
      '=',
      'ACTIVE',
      subQueryBuilderMock.andWhere as jest.Mock,
      mockCall,
    );
  }

  function expectToContainSecondaryEqualsOrCondition(
    field: string,
    mockCall: number = 0,
  ): void {
    expectToContainBasicOperandCondition(
      field,
      '=',
      'ACTIVE',
      subQueryBuilderMock.orWhere as jest.Mock,
      mockCall,
    );
  }

  function expectToCreateValidQueryWithBasicComparisonOperation(
    ConditionClass: new (
      field: ConditionField,
      value: ConditionValue,
    ) => Condition,
    operand: string,
  ): void {
    const field = 'age';
    const value = 20;
    const criteria = new Criteria(
      [
        new ConditionClass(
          new ConditionField(field),
          new ConditionValue(value),
        ),
      ],
      simpleOrderCriteria,
    );

    mapper.map(queryBuilderMock as SelectQueryBuilder<ObjectLiteral>, criteria);

    expectToContainBasicOperandCondition(
      field,
      operand,
      value,
      queryBuilderMock.andWhere as jest.Mock,
    );
  }

  function expectToContainBasicOperandCondition(
    field: string,
    operand: string,
    value: Primitives,
    logicalConditionMock: jest.Mock,
    mockCall: number = 0,
  ): void {
    expect(logicalConditionMock.mock.calls[mockCall]).toEqual([
      `"${field}" ${operand} :${field}`,
      {
        [`${field}`]: value,
      },
    ]);
  }

  function expectToCreateValidQueryWithContainsComparisonOperation(
    ConditionClass: new (
      field: ConditionField,
      value: ConditionValue[],
    ) => Condition,
    operand: string,
  ): void {
    const field = 'age';
    const values = [18, 22, 30];
    const criteria = new Criteria(
      [
        new ConditionClass(
          new ConditionField(field),
          values.map((value) => new ConditionValue(value)),
        ),
      ],
      simpleOrderCriteria,
    );

    mapper.map(queryBuilderMock as SelectQueryBuilder<ObjectLiteral>, criteria);

    expectToContainContainsOperandCondition(field, operand, values);
  }

  function expectToContainContainsOperandCondition(
    field: string,
    operand: string,
    value: Primitives[],
    mockCall: number = 0,
  ): void {
    expect(
      (queryBuilderMock.andWhere as jest.Mock).mock.calls[mockCall],
    ).toEqual([
      `"${field}" ${operand} (:...${field})`,
      {
        [`${field}`]: value,
      },
    ]);
  }
});
