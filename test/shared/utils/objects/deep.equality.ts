import { deepStrictEqual } from 'assert';
import { LoggingSymbols } from 'src/server/app.logging.symbols';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';

declare type ObjectToCompare = any;

export function deepEqualStrict(
  objectA: ObjectToCompare,
  objectB: ObjectToCompare,
): boolean {
  try {
    deepStrictEqual(objectA, objectB);
    return true;
  } catch (error) {
    const logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.errors)
        .withClassName(this.constructor.name)
        .build(),
    );
    logger.error(`Error comparing two objects`, {
      error: { message: error.message, stack: error.stack },
      objectA,
      objectB,
    });
    return false;
  }
}
