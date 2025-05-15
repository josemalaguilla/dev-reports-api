import { Developer } from 'src/modules/developers/domain/entities/developer';
import { DeveloperId } from 'src/modules/developers/domain/value-objects/developer.id';
import { DeveloperStatus } from 'src/modules/developers/domain/value-objects/developer.status';
import { DeveloperEmailMother } from '../value-objects/developer.email.mother';
import { DeveloperLastNameMother } from '../value-objects/developer.last.name.mother';
import { DeveloperNameMother } from '../value-objects/developer.name.mother';

export class DeveloperMother {
  public static random(): Developer {
    return new Developer(
      DeveloperId.create(),
      DeveloperNameMother.random(),
      DeveloperEmailMother.random(),
      DeveloperStatus.active(),
      DeveloperLastNameMother.random(),
    );
  }
}
