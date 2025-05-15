import { AggregateRoot } from '../../core/domain/entities/aggregate.root';
import { Nullable } from '../../core/domain/nullable';
import { Criteria, Filters } from './criteria/criteria';
import { CountResult } from './responses/count.result';

export declare interface Repository<Entity extends AggregateRoot> {
  find(criteria: Criteria): Promise<Entity[]>;
  count(filters: Filters): Promise<CountResult>;
  findOne(filters: Filters): Promise<Nullable<Entity>>;
  delete(entity: Entity): Promise<void>;
  save(entity: Entity): Promise<void>;
}
