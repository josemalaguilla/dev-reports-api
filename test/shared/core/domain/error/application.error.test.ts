import { ApplicationError } from 'src/shared/core/domain/errors/application.error';

describe('ApplicationError', () => {
  it('should set the correct name property', () => {
    const error = new ApplicationError();
    expect(error.name).toBe('ApplicationError');
  });

  it('should capture the stack trace', () => {
    const captureStackTraceSpy = jest.spyOn(Error, 'captureStackTrace');

    const error = new ApplicationError();

    expect(captureStackTraceSpy).toHaveBeenCalledWith(error, ApplicationError);
    captureStackTraceSpy.mockRestore();
  });

  it('should set the correct prototype chain', () => {
    const error = new ApplicationError();
    expect(Object.getPrototypeOf(error)).toBe(ApplicationError.prototype);
  });

  it('should be an instance of Error and ApplicationError', () => {
    const error = new ApplicationError();
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
  });
});
