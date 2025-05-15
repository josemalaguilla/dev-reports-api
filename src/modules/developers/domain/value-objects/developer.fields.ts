import { LoggingSymbols } from 'src/server/app.logging.symbols';
import { InvalidArgumentError } from 'src/shared/core/domain/errors/invalid-argument.error';
import { ArrayValueObject } from 'src/shared/core/domain/value-object/array.value.object';
import { Printable } from 'src/shared/core/domain/value-object/printable';
import { Logger } from 'src/shared/logger/domain/ports/logger';
import {
  LoggerContextBuilder,
  LoggingClassTypes,
} from 'src/shared/logger/domain/services/logger.context.builder';
import { LoggerFactory } from 'src/shared/logger/infrastructure/logger.factory';

export class DeveloperFields implements ArrayValueObject<string>, Printable {
  private readonly fields: string[];
  private readonly entityFields: string[] = [
    'id',
    'name',
    'lastName',
    'email',
    'status',
    'deletedAt',
  ];
  private readonly logger: Logger;

  constructor(fields: string[]) {
    this.logger = LoggerFactory.create(
      new LoggerContextBuilder()
        .withModule(LoggingSymbols.developers)
        .withClassType(LoggingClassTypes.entities)
        .withClassName(this.constructor.name)
        .build(),
    );
    this.ensureFieldsAreDeveloperFields(fields);
    this.fields = fields;
    this.logger.debug('Created developer fields', { fields });
  }

  public ensureFieldsAreDeveloperFields(fields: string[]) {
    for (const field of fields) {
      if (!this.entityFields.includes(field)) {
        this.logger.error('Invalid developer field', { field });
        throw new InvalidArgumentError(
          `Invalid field has been found in fields param ${field}`,
        );
      }
    }
  }

  public value(): string[] {
    return this.fields;
  }

  public equals(otherValue: DeveloperFields): boolean {
    const otherValueFields = otherValue.value();
    this.logger.verbose('Fields are equal', {
      fields: this.fields,
      otherValueFields,
    });
    if (otherValueFields.length !== this.fields.length) return false;

    for (const field of otherValue.value()) {
      if (!this.fields.includes(field)) return false;
    }
    return true;
  }

  public length(): number {
    return this.fields.length;
  }

  public toString(): string {
    return this.value().join(', ');
  }
}
