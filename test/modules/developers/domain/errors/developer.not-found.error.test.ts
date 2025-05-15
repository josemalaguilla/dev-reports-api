import { DeveloperNotFoundError } from '../../../../../src/modules/developers/domain/errors/developer.not-found.error';
import { DeveloperId } from '../../../../../src/modules/developers/domain/value-objects/developer.id';

describe('DeveloperNotFoundError', () => {
  it('should contain the correct message', () => {
    const id = DeveloperId.create();

    const error = new DeveloperNotFoundError(id);

    expect(error.message).toBe(`Developer with id ${id.value()} not found`);
  });
});
