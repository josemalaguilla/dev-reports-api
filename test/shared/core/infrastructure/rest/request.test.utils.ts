import * as request from 'supertest';

function expectToReturnStatusCode(
  statusCode: number,
  response: request.Response,
): void {
  expect(response.statusCode).toBe(statusCode);
}

function expectToReturnError(
  response: request.Response,
  errorName: string,
  errorMessage: string,
): void {
  expect(response.body.error).toBe(errorName);
  expect(response.body.message).toContain(errorMessage);
}

export { expectToReturnError, expectToReturnStatusCode };
