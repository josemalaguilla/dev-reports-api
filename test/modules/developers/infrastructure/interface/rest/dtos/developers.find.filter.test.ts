import { validate } from 'class-validator';
import 'reflect-metadata';
import {
  expectToBeInvalidByErrors,
  expectToBeInvalidProperty,
  expectToBeValid,
} from 'test/shared/core/infrastructure/rest/dto.test.utils';
import { DevelopersFindFilter } from '../../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/developers.find.filter';

describe('DevelopersFindFilter', () => {
  let filter: DevelopersFindFilter;
  beforeEach(() => {
    filter = new DevelopersFindFilter();
    filter.name = 'John';
    filter.lastName = 'Doe';
    filter.email = 'john.doe@example.com';
  });

  it('should validate valid data', async () => {
    const errors = await validate(filter);

    expectToBeValid(errors);
  });

  it('should validate empty data', async () => {
    const errors = await validate(new DevelopersFindFilter());

    expectToBeValid(errors);
  });

  it('should fail when invalid email', async () => {
    forceInvalidEmail();

    const errors = await validate(filter);

    expectToBeInvalidByErrors(1, errors);
    expectToBeInvalidProperty<keyof DevelopersFindFilter>('email', errors);
  });

  function forceInvalidEmail(): void {
    filter.email = 'invalid-email';
  }
});
