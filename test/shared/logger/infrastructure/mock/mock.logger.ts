import { Logger } from '../../../../../src/shared/logger/domain/ports/logger';

export class MockLogger implements Logger {
  log = jest.fn();
  error = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
  verbose = jest.fn();
}
