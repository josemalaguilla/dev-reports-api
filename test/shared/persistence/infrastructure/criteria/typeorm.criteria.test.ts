import { Pagination } from 'src/shared/persistence/domain/criteria/pagination';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { Criteria } from '../../../../../src/shared/persistence/domain/criteria/criteria';
import { Limit } from '../../../../../src/shared/persistence/domain/criteria/limit';
import { Offset } from '../../../../../src/shared/persistence/domain/criteria/offset';
import { Order } from '../../../../../src/shared/persistence/domain/criteria/order';
import { OrderField } from '../../../../../src/shared/persistence/domain/criteria/order.field';
import { OrderType } from '../../../../../src/shared/persistence/domain/criteria/order.type';
import { TypeORMCriteriaMapper } from '../../../../../src/shared/persistence/infrastructure/typeorm/criteria/typeorm.criteria.mapper';
import { TypeORMQueryBuilderMock } from './mocks/typeorm.query.builder.mock';

jest.mock('typeorm');

describe('Criterial pagination and ordering test', () => {
  let mapper: TypeORMCriteriaMapper;
  let queryBuilderMock: Partial<SelectQueryBuilder<ObjectLiteral>>;

  beforeEach(() => {
    mapper = new TypeORMCriteriaMapper();
    queryBuilderMock = new TypeORMQueryBuilderMock();
  });

  describe('Ordering', () => {
    it('should add ordering ASC to query builder', () => {
      expectToAddOrderCriteriaToQuery(OrderType.asc(), 'ASC');
    });

    it('should add ordering DESC to query builder', () => {
      expectToAddOrderCriteriaToQuery(OrderType.desc(), 'DESC');
    });

    function expectToAddOrderCriteriaToQuery(
      type: OrderType,
      orderCriteria: 'ASC' | 'DESC',
    ): void {
      const field = 'name';
      const order = new Order(new OrderField('name'), type);
      const criteria = new Criteria([], order);

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith(
        field,
        orderCriteria,
      );
    }
  });

  describe('Pagination', () => {
    it('should not add any pagination terms if no pagination is given', () => {
      const criteria = new Criteria(
        [],
        new Order(new OrderField('name'), OrderType.asc()),
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expect(queryBuilderMock.take).not.toHaveBeenCalled();
      expect(queryBuilderMock.skip).not.toHaveBeenCalled();
    });

    it('should add pagination terms when given', () => {
      const limit = 100;
      const offset = 20;
      const criteria = new Criteria(
        [],
        new Order(new OrderField('name'), OrderType.asc()),
        new Pagination(new Limit(limit), new Offset(offset)),
      );

      mapper.map(
        queryBuilderMock as SelectQueryBuilder<ObjectLiteral>,
        criteria,
      );

      expect(queryBuilderMock.take).toHaveBeenCalledWith(limit);
      expect(queryBuilderMock.skip).toHaveBeenCalledWith(offset);
    });
  });
});
