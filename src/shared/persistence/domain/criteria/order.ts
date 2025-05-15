import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { InvalidArgumentError } from '../../../core/domain/errors/invalid-argument.error';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { OrderField } from './order.field';
import { OrderType } from './order.type';

export interface OrderPrimitives {
  orderBy: string;
  orderType: string;
}

export class Order implements Printable {
  private readonly logger: Logger;

  constructor(
    readonly orderBy: OrderField,
    readonly orderType: OrderType,
  ) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.persistence)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureOrderIsValid(orderBy, orderType);
    this.logger.debug('Created order', {
      orderBy,
      orderType,
    });
  }

  private ensureOrderIsValid(orderBy: OrderField, orderType: OrderType) {
    if (!orderBy) {
      this.logger.error('Order by field is missing', { orderBy });
      throw new InvalidArgumentError(
        `Order by field should be given. Found: ${orderBy}`,
      );
    }

    if (!orderType) {
      this.logger.error('Order type is missing', { orderType });
      throw new InvalidArgumentError(
        `Order type should be given. Found: ${orderType}`,
      );
    }
  }

  public toPrimitives(): OrderPrimitives {
    return {
      orderBy: this.orderBy.value(),
      orderType: this.orderType.value(),
    };
  }

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
