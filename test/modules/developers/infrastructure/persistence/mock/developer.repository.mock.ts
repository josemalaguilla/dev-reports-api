import { Developer } from 'src/modules/developers/domain/entities/developer';
import { DeveloperRepository } from 'src/modules/developers/domain/ports/developer.repository';
import { BasicRepositoryMock } from 'test/shared/persistence/infrastructure/mock/basic.repository.mock';

export class DeveloperRepositoryMock
  extends BasicRepositoryMock<Developer>
  implements DeveloperRepository {}
