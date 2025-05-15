import { AggregateRoot } from 'src/shared/core/domain/entities/aggregate.root';
import { Repository } from 'src/shared/persistence/domain/repository';

export class BasicRepositoryMock<Entity extends AggregateRoot>
  implements Repository<Entity>
{
  find = jest.fn();
  count = jest.fn();
  findOne = jest.fn();
  delete = jest.fn();
  save = jest.fn();
}
