import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../../../src/shared/logger/domain/services/logger.context.builder';
import { LoggerContext } from '../../../../../src/shared/logger/domain/value-objects/logger.context';

describe('LoggerContextBuilder', () => {
  let builder: LoggerContextBuilder;

  beforeEach(() => {
    builder = new LoggerContextBuilder();
  });

  it('should create empty context when no values are provided', () => {
    const context = builder.build();

    expect(context).toBeInstanceOf(LoggerContext);
    expectContextToBe('', context);
  });

  it('should add module to context', () => {
    const context = builder.withModule(LoggingSymbols.developers).build();

    expectContextToBe(LoggingSymbols.developers, context);
  });

  it('should add class type to context', () => {
    const context = builder.withClassType(LoggingClassTypes.useCase).build();

    expectContextToBe(LoggingClassTypes.useCase, context);
  });

  it('should add class name to context', () => {
    const className = 'TestClass';
    const context = builder.withClassName(className).build();

    expectContextToBe(className, context);
  });

  it('should build context with all components in correct order', () => {
    const context = builder
      .withModule(LoggingSymbols.developers)
      .withClassType(LoggingClassTypes.useCase)
      .withClassName('FindDeveloper')
      .build();

    const expectedContext = [
      LoggingSymbols.developers,
      LoggingClassTypes.useCase,
      'FindDeveloper',
    ].join('.');

    expectContextToBe(expectedContext, context);
  });

  it('should build context with partial components', () => {
    const context = builder
      .withModule(LoggingSymbols.developers)
      .withClassName('TestClass')
      .build();

    expectContextToBe(`${LoggingSymbols.developers}.TestClass`, context);
  });

  function expectContextToBe(
    expectedContext: string,
    context: LoggerContext,
  ): void {
    expect(context.value()).toBe(expectedContext);
  }
});
