import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { Nullable } from '../../../../shared/core/domain/nullable';
import {
  Criteria,
  Filters,
} from '../../../../shared/persistence/domain/criteria/criteria';
import { Developer } from '../entities/developer';

export interface DeveloperRepository {
  find(criteria: Criteria): Promise<Developer[]>;
  findOne(filters: Filters): Promise<Nullable<Developer>>;
  count(filters: Filters): Promise<CountResult>;
  delete(entity: Developer): Promise<void>;
  save(entity: Developer): Promise<void>;
}
