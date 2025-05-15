import { CountResult } from 'src/shared/persistence/domain/responses/count.result';
import { Nullable } from '../../../../shared/core/domain/nullable';
import {
  Criteria,
  Filters,
} from '../../../../shared/persistence/domain/criteria/criteria';
import { Report } from '../entities/report';

export interface ReportRepository {
  find(criteria: Criteria): Promise<Report[]>;
  findOne(filters: Filters): Promise<Nullable<Report>>;
  count(filters: Filters): Promise<CountResult>;
  delete(entity: Report): Promise<void>;
  save(entity: Report): Promise<void>;
}
