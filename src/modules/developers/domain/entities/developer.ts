import { Nullable } from 'src/shared/core/domain/nullable';
import { DateString } from 'src/shared/core/domain/value-object/date.value.object';
import { AggregateRoot } from '../../../../shared/core/domain/entities/aggregate.root';
import { CreateDeveloperDomainEvent } from '../events/create.developer.domain.event';
import { DeleteDeveloperDomainEvent } from '../events/delete.developer.domain.event';
import { UpdateDeveloperEmailDomainEvent } from '../events/update.developer.email.domain.event';
import { UpdateDeveloperLastNameDomainEvent } from '../events/update.developer.lastname.domain.event';
import { UpdateDeveloperNameDomainEvent } from '../events/update.developer.name.domain.event';
import { DeveloperDeletedAt } from '../value-objects/developer.deleted.at';
import { DeveloperEmail } from '../value-objects/developer.email';
import { DeveloperId } from '../value-objects/developer.id';
import { DeveloperLastName } from '../value-objects/developer.last.name';
import { DeveloperName } from '../value-objects/developer.name';
import { DeveloperStatus } from '../value-objects/developer.status';

export declare type DeveloperWithPrimitives = {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  status: string;
  deletedAt?: DateString;
};

export class Developer extends AggregateRoot {
  private _id: DeveloperId;
  private _name: DeveloperName;
  private _lastName?: DeveloperLastName;
  private _email: DeveloperEmail;
  private _status: DeveloperStatus;
  private _deletedAt?: DeveloperDeletedAt;

  constructor(
    id: DeveloperId,
    name: DeveloperName,
    email: DeveloperEmail,
    status: DeveloperStatus,
    lastName?: DeveloperLastName,
    deletedAt?: DeveloperDeletedAt,
  ) {
    super();
    this._id = id;
    this._name = name;
    this._lastName = lastName;
    this._email = email;
    this._status = status;
    this._deletedAt = deletedAt;
    this.logger.verbose('Created developer', {
      id: this.id,
      name: this.name,
      email: this.email,
      status: this.status,
      lastName: this.lastName,
      deletedAt: this.deletedAt,
    });
  }

  public static create(
    id: DeveloperId,
    name: DeveloperName,
    email: DeveloperEmail,
    lastName?: DeveloperLastName,
  ): Developer {
    const developer = new Developer(
      id,
      name,
      email,
      DeveloperStatus.active(),
      lastName,
    );
    developer.record(
      new CreateDeveloperDomainEvent(
        developer.id.value(),
        developer.name.value(),
        developer.email.value(),
        developer.status.value(),
        developer.lastName?.value(),
      ),
    );
    return developer;
  }

  public static fromPrimitives(entity: DeveloperWithPrimitives): Developer {
    return new Developer(
      new DeveloperId(entity.id),
      new DeveloperName(entity.name),
      new DeveloperEmail(entity.email),
      new DeveloperStatus(entity.status),
      entity.lastName && new DeveloperLastName(entity.lastName),
      entity.deletedAt && new DeveloperDeletedAt(entity.deletedAt),
    );
  }

  public get id(): DeveloperId {
    return this._id;
  }
  public get name(): DeveloperName {
    return this._name;
  }
  public get lastName(): Nullable<DeveloperLastName> {
    return this._lastName;
  }
  public get email(): DeveloperEmail {
    return this._email;
  }
  public get status(): DeveloperStatus {
    return this._status;
  }
  public get deletedAt(): Nullable<DeveloperDeletedAt> {
    return this._deletedAt;
  }

  public getId(): string {
    return this.id.value();
  }

  public toPrimitives(): DeveloperWithPrimitives {
    return {
      id: this.id.value(),
      name: this.name.value(),
      lastName: this.lastName?.value(),
      email: this.email.value(),
      status: this.status.value(),
      deletedAt: this.deletedAt?.value(),
    };
  }

  public equals(otherDeveloper: Developer): boolean {
    const isEquals =
      this.id.equals(otherDeveloper.id) &&
      this.name.equals(otherDeveloper.name) &&
      this.email.equals(otherDeveloper.email) &&
      this.status.equals(otherDeveloper.status) &&
      this.optionalFieldsAreEquals(this.lastName, otherDeveloper.lastName) &&
      this.optionalFieldsAreEquals(this.deletedAt, otherDeveloper.deletedAt);
    this.logger.verbose('Comparing developers', {
      id: this.id,
      otherId: otherDeveloper.id,
      isEquals,
    });
    return isEquals;
  }

  public updateName(newName: DeveloperName): void {
    const oldName = this.name.value();
    this.logger.debug('Updating developer name', {
      id: this.id,
      oldName,
      newName,
    });
    this._name = newName;
    this.record(
      new UpdateDeveloperNameDomainEvent(
        this.id.value(),
        this.name.value(),
        oldName,
      ),
    );
  }

  public updateLastName(lastName: Nullable<DeveloperLastName>): void {
    const oldLastName = this.lastName?.value();
    this.logger.debug('Updating developer last name', {
      id: this.id,
      oldLastName,
      newLastName: lastName,
    });
    this._lastName = lastName;
    this.record(
      new UpdateDeveloperLastNameDomainEvent(
        this.id.value(),
        this.lastName?.value(),
        oldLastName,
      ),
    );
  }

  public updateEmail(email: DeveloperEmail): void {
    const oldEmail = this.email.value();
    this.logger.debug('Updating developer email', {
      id: this.id,
      oldEmail,
      newEmail: email,
    });
    this._email = email;
    this.record(
      new UpdateDeveloperEmailDomainEvent(
        this.id.value(),
        this.email.value(),
        oldEmail,
      ),
    );
  }

  public delete(): void {
    this.logger.debug('Deleting developer', { id: this.id });
    this._deletedAt = DeveloperDeletedAt.now();
    this.record(
      new DeleteDeveloperDomainEvent(this.id.value(), this.deletedAt.value()),
    );
  }
}
