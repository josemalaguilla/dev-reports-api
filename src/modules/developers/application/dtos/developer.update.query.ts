import { DeveloperEmail } from '../../domain/value-objects/developer.email';
import { DeveloperLastName } from '../../domain/value-objects/developer.last.name';
import { DeveloperName } from '../../domain/value-objects/developer.name';

export declare type UpdateQueryWithPrimitives = {
  name?: string;
  lastName?: string;
  email?: string;
};

export class DeveloperUpdateQuery {
  constructor(
    public name?: DeveloperName,
    public lastName?: DeveloperLastName,
    public email?: DeveloperEmail,
  ) {}

  public toPrimitives(): UpdateQueryWithPrimitives {
    const result: UpdateQueryWithPrimitives = {};
    if (this.name) {
      result.name = this.name.value();
    }
    if (this.lastName) {
      result.lastName = this.lastName.value();
    }
    if (this.email) {
      result.email = this.email.value();
    }

    return result;
  }
}
