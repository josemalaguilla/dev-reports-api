import { DuplicateEmailError } from '../../../../../src/modules/developers/domain/errors/duplicate.email.error';
import { DeveloperEmailMother } from '../value-objects/developer.email.mother';

describe('DuplicateEmailError', () => {
  it('should contain the correct message', () => {
    const email = DeveloperEmailMother.random();

    const error = new DuplicateEmailError(email);

    expect(error.message).toBe(
      `Already exists an instance for the given email ${email.value()}`,
    );
  });
});
