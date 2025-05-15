import { validate } from 'class-validator';
import 'reflect-metadata';
import {
  expectToBeInvalidByErrors,
  expectToBeInvalidProperty,
  expectToBeValid,
} from 'test/shared/core/infrastructure/rest/dto.test.utils';
import { UpdateDeveloperRequest } from '../../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/update.developer.request';

describe('UpdateDeveloperRequest', () => {
  let filter: UpdateDeveloperRequest;
  beforeEach(() => {
    filter = new UpdateDeveloperRequest();
    filter.name = 'John';
    filter.lastName = 'Doe';
    filter.email = 'john.doe@example.com';
  });

  it('should validate valid data', async () => {
    const errors = await validate(filter);

    expectToBeValid(errors);
  });

  it('should validate empty data', async () => {
    const errors = await validate(new UpdateDeveloperRequest());

    expectToBeValid(errors);
  });

  it('should fail when invalid email', async () => {
    forceInvalidEmail();

    const errors = await validate(filter);

    expectToBeInvalidByErrors(1, errors);
    expectToBeInvalidProperty<keyof UpdateDeveloperRequest>('email', errors);
  });

  function forceInvalidEmail(): void {
    filter.email = 'invalid-email';
  }
});
