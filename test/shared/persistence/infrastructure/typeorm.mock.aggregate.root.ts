import { Uuid } from 'src/shared/core/domain/value-object/uuid';
import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { AggregateRoot } from '../../../../src/shared/core/domain/entities/aggregate.root';

export declare type TypeORMMockEntityWithPrimitives = {
  id: string;
  email: string;
  name: string;
  lastName: string;
};

export class TypeORMMockAggregateRoot extends AggregateRoot {
  private _id: Uuid;
  private _email: string;
  private _name: string;
  private _lastName: string;

  constructor(id: Uuid, email: string, name: string, lastName: string) {
    super();
    this._id = id;
    this._email = email;
    this._name = name;
    this._lastName = lastName;
    this.logger.verbose('Created mock aggregate root', {
      id: this.id,
      email: this.email,
      name: this.name,
      lastName: this.lastName,
    });
  }

  public static random(): TypeORMMockAggregateRoot {
    const randomizer = RandomizerStore.get();
    return new TypeORMMockAggregateRoot(
      Uuid.create(),
      randomizer.email(),
      randomizer.firstName(),
      randomizer.lastName(),
    );
  }

  public static fromPrimitives(
    entity: TypeORMMockEntityWithPrimitives,
  ): TypeORMMockAggregateRoot {
    return new TypeORMMockAggregateRoot(
      new Uuid(entity.id),
      entity.email,
      entity.name,
      entity.lastName,
    );
  }

  public get id(): string {
    return this._id.value();
  }

  public get email(): string {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public getId(): string {
    return this.id;
  }

  public toPrimitives(): TypeORMMockEntityWithPrimitives {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      lastName: this.lastName,
    };
  }

  public equals(other: TypeORMMockAggregateRoot): boolean {
    const isEquals =
      this.id === other.id &&
      this.email === other.email &&
      this.name === other.name &&
      this.lastName === other.lastName;
    this.logger.verbose('Comparing mock aggregate roots', {
      id: this.id,
      otherId: other.id,
      isEquals,
    });
    return isEquals;
  }
}
