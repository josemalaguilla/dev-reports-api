import { DeveloperEmail } from '../../domain/value-objects/developer.email';
import { DeveloperLastName } from '../../domain/value-objects/developer.last.name';
import { DeveloperName } from '../../domain/value-objects/developer.name';

export const DeveloperFiltrableFields = ['id', 'name', 'lastName', 'email'];

interface DeveloperFilterQueryPrimitives {
  name?: string;
  lastName?: string;
  email?: string;
}

export class DeveloperFilterQuery {
  constructor(
    public name?: DeveloperName,
    public lastName?: DeveloperLastName,
    public email?: DeveloperEmail,
  ) {}

  public static fromStringWhere(where: string): DeveloperFilterQuery {
    const whereObject = JSON.parse(where);
    return this.fromPrimitive(whereObject);
  }

  public static fromPrimitive(
    where: DeveloperFilterQueryPrimitives,
  ): DeveloperFilterQuery {
    return new DeveloperFilterQuery(
      where.name && new DeveloperName(where.name),
      where.lastName && new DeveloperLastName(where.lastName),
      where.email && new DeveloperEmail(where.email),
    );
  }

  public toPrimitives(): DeveloperFilterQueryPrimitives {
    return {
      name: this.name?.value?.(),
      lastName: this.lastName?.value?.(),
      email: this.email?.value?.(),
    };
  }
}
