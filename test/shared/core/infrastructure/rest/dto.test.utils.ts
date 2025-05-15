import { ValidationError } from 'class-validator';

function expectToBeValid(errors: ValidationError[]): void {
  expectToBeInvalidByErrors(0, errors);
}

function expectToBeInvalidByErrors(
  numberOfErrors: number,
  errors: ValidationError[],
): void {
  expect(errors.length).toBe(numberOfErrors);
}

function expectToBeInvalidProperty<ValidField extends string>(
  fieldName: ValidField,
  errors,
): void {
  expect(errors[0].property).toBe(fieldName);
}

export {
  expectToBeInvalidByErrors,
  expectToBeInvalidProperty,
  expectToBeValid,
};
