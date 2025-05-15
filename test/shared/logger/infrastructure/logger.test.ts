// Should be on top to prevent the other imports to import the real logger
import { MockLogger } from './mock/mock.logger';
const mockLogger = mockNestLogger();

import { Uuid } from 'src/shared/core/domain/value-object/uuid';
import { LoggerContextBuilder } from 'src/shared/logger/domain/services/logger.context.builder';
import { LogsEnabledMatcher } from 'src/shared/logger/domain/services/logs.enabled.matcher';
import { LoggerFactory } from '../../../../src/shared/logger/infrastructure/logger.factory';

describe('Logger', () => {
  const testCases = [
    { method: 'log', message: 'test log message' },
    { method: 'error', message: 'test error message' },
    { method: 'warn', message: 'test warn message' },
    { method: 'debug', message: 'test debug message' },
    { method: 'verbose', message: 'test verbose message' },
  ];

  beforeAll(() => {
    LogsEnabledMatcher.initialize('core.*, logger.*');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  testCases.forEach(({ method, message }) => {
    describe(`${method}`, () => {
      it(`should log ${method} message when logs are enabled`, () => {
        const loggerContext = new LoggerContextBuilder()
          .withClassName('logger.test.myClass')
          .build();
        const logger = LoggerFactory.create(loggerContext);
        const logData = { test: '1' };

        logger[method](message, logData);

        expect(mockLogger[method]).toHaveBeenCalledWith(message, logData);
      });

      it(`should not log ${method} message when logs are disabled`, () => {
        const disabledLogContext = 'customModule.persistence.myClass';
        const loggerContext = new LoggerContextBuilder()
          .withClassName(disabledLogContext)
          .build();
        const logger = LoggerFactory.create(loggerContext);
        const logData = { test: '1' };

        logger[method](message, logData);

        expect(mockLogger[method]).not.toHaveBeenCalledWith(message, logData);
      });
    });
  });

  it('should convert value objects into printable when are embedded in objects', () => {
    const loggerContext = new LoggerContextBuilder()
      .withClassName('logger.test.myClass')
      .build();
    const logger = LoggerFactory.create(loggerContext);
    const printableObject = Uuid.create();
    const logData = { id: printableObject };
    const message = 'This is a test';

    logger.warn(message, logData);

    expect(mockLogger.warn).toHaveBeenCalledWith(message, {
      id: printableObject.toString(),
    });
  });

  it('should convert value objects into printable when are main params', () => {
    const loggerContext = new LoggerContextBuilder()
      .withClassName('logger.test.myClass')
      .build();
    const logger = LoggerFactory.create(loggerContext);
    const printableObject = Uuid.create();
    const message = 'This is a test';

    logger.warn(message, printableObject);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      message,
      printableObject.toString(),
    );
  });
});

function mockNestLogger(): MockLogger {
  const mockLogger = new MockLogger();
  jest.mock('@nestjs/common', () => ({
    Logger: jest.fn().mockImplementation(() => mockLogger),
  }));
  return mockLogger;
}
