import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { DomainEvent } from 'src/shared/events/domain/domain.event';
import { Logger } from '../../../logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from '../../../logger/domain/services/logger.context.builder';
import { LoggerFactory } from '../../../logger/infrastructure/logger.factory';
import { Primitives } from '../value-object/primitive.value.object';
import { Printable } from '../value-object/printable';
import { ValueObject } from '../value-object/value.object';

declare type PrimitiveAggregateRoot = any;

export abstract class AggregateRoot implements Printable {
  private domainEvents: Array<DomainEvent>;
  protected readonly logger: Logger;

  constructor() {
    this.domainEvents = [];
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.core)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.logger.debug(`Created ${this.constructor.name}`);
  }

  public pullDomainEvents(): Array<DomainEvent> {
    const domainEvents = this.domainEvents.slice();
    this.domainEvents = [];

    this.logger.debug(`Pulled domain events`, {
      eventsCount: domainEvents.length,
    });
    return domainEvents;
  }

  public record(event: DomainEvent): void {
    this.logger.debug(`Recording domain event`, { eventName: event.eventName });
    this.domainEvents.push(event);
  }

  protected optionalFieldsAreEquals<T extends Primitives>(
    currentValue: ValueObject<T>,
    otherValue: ValueObject<T>,
  ): boolean {
    const areNotDefined = !currentValue && !otherValue;
    const areEquals =
      currentValue && otherValue && currentValue.equals(otherValue);
    return areNotDefined || areEquals;
  }

  abstract getId(): string;

  abstract toPrimitives(): PrimitiveAggregateRoot;

  public toString(): string {
    return JSON.stringify(this.toPrimitives());
  }
}
