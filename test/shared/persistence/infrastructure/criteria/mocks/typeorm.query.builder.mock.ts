export class TypeORMQueryBuilderMock {
  select = jest.fn().mockReturnThis();
  from = jest.fn().mockReturnThis();
  where = jest.fn().mockReturnThis();
  andWhere = jest.fn().mockReturnThis();
  orWhere = jest.fn().mockReturnThis();
  addOrderBy = jest.fn().mockReturnThis();
  take = jest.fn().mockReturnThis();
  skip = jest.fn().mockReturnThis();
  orderBy = jest.fn().mockReturnThis();
}
