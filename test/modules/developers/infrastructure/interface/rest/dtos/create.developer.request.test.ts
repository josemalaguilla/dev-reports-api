import { validate } from 'class-validator';
import 'reflect-metadata';
import {
  expectToBeInvalidByErrors,
  expectToBeInvalidProperty,
  expectToBeValid,
} from 'test/shared/core/infrastructure/rest/dto.test.utils';
import { RandomizerStore } from 'test/shared/randomizer/infrastructure/randomizer.store';
import { CreateDeveloperRequest } from '../../../../../../../src/modules/developers/infrastructure/interface/rest/dtos/create.developer.request';

describe('CreateDeveloperRequest', () => {
  let request: CreateDeveloperRequest;

  beforeEach(() => {
    const randomizer = RandomizerStore.get();
    request = new CreateDeveloperRequest();
    request.name = randomizer.firstName();
    request.lastName = randomizer.lastName();
    request.email = randomizer.email();
  });

  it('should validate valid data', async () => {
    const errors = await validate(request);

    expectToBeValid(errors);
  });

  it('should fail validation for missing name', async () => {
    removeFieldFromValidInstance('name');

    const errors = await validate(request);

    expectToBeInvalidByErrors(1, errors);
    expectToBeInvalidProperty<keyof CreateDeveloperRequest>('name', errors);
  });

  it('should be valid if missing status field', async () => {
    removeFieldFromValidInstance('lastName');

    const errors = await validate(request);

    expectToBeValid(errors);
  });

  it('should fail validation for missing email', async () => {
    removeFieldFromValidInstance('email');

    const errors = await validate(request);

    expectToBeInvalidByErrors(1, errors);
    expectToBeInvalidProperty<keyof CreateDeveloperRequest>('email', errors);
  });

  it('should fail validation for invalid email', async () => {
    forceInvalidEmail();

    const errors = await validate(request);

    expectToBeInvalidByErrors(1, errors);
    expectToBeInvalidProperty<keyof CreateDeveloperRequest>('email', errors);
  });

  function removeFieldFromValidInstance(
    fieldName: keyof CreateDeveloperRequest,
  ): void {
    delete request[fieldName];
  }

  function forceInvalidEmail(): void {
    request.email = 'invalid-email';
  }
});
