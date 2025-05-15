import { DeveloperEmail } from 'src/modules/developers/domain/value-objects/developer.email';
import { DeveloperLastName } from 'src/modules/developers/domain/value-objects/developer.last.name';
import { DeveloperName } from 'src/modules/developers/domain/value-objects/developer.name';
import {
  DeveloperUpdateQuery,
  UpdateQueryWithPrimitives,
} from '../../../../../src/modules/developers/application/dtos/developer.update.query';
import { DeveloperEmailMother } from '../../domain/value-objects/developer.email.mother';
import { DeveloperLastNameMother } from '../../domain/value-objects/developer.last.name.mother';
import { DeveloperNameMother } from '../../domain/value-objects/developer.name.mother';

describe('DeveloperUpdateQuery', () => {
  let name: DeveloperName;
  let lastName: DeveloperLastName;
  let email: DeveloperEmail;

  beforeEach(() => {
    name = DeveloperNameMother.random();
    lastName = DeveloperLastNameMother.random();
    email = DeveloperEmailMother.random();
  });

  describe('Property set', () => {
    it('should create valid query when updating all fields', () => {
      const updateQuery = new DeveloperUpdateQuery(name, lastName, email);

      expectToMatchInputValues(updateQuery);
    });

    it('should create valid query when updating some fields', () => {
      name = undefined;
      email = undefined;

      const updateQuery = new DeveloperUpdateQuery(name, lastName, email);

      expectToMatchInputValues(updateQuery);
    });
  });

  describe('Conversion to primitives', () => {
    it('should return all primitive values', () => {
      const updateQuery = new DeveloperUpdateQuery(name, lastName, email);

      const updateWithPrimitives = updateQuery.toPrimitives();

      expectToMatchInputPrimitives(updateWithPrimitives);
    });

    it('should not return missing values on primitives', () => {
      name = undefined;
      email = undefined;

      const updateQuery = new DeveloperUpdateQuery(name, lastName, email);

      const updateWithPrimitives = updateQuery.toPrimitives();

      expectToOnlyReturnDefinedValues(updateWithPrimitives);
    });
  });

  function expectToMatchInputValues(updateQuery: DeveloperUpdateQuery) {
    expect(updateQuery.name).toBe(name);
    expect(updateQuery.lastName).toBe(lastName);
    expect(updateQuery.email).toBe(email);
  }

  function expectToMatchInputPrimitives(
    updateWithPrimitives: UpdateQueryWithPrimitives,
  ): void {
    expect(updateWithPrimitives.name).toBe(name.value());
    expect(updateWithPrimitives.lastName).toBe(lastName.value());
    expect(updateWithPrimitives.email).toBe(email.value());
  }

  function expectToOnlyReturnDefinedValues(
    updateWithPrimitives: UpdateQueryWithPrimitives,
  ): void {
    expect(Object.keys(updateWithPrimitives).length).toBe(1);
    expect(updateWithPrimitives.lastName).toBe(lastName.value());
  }
});
