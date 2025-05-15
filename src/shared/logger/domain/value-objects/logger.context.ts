import { Printable } from 'src/shared/core/domain/value-object/printable';
import { LogsEnabledMatcher } from '../services/logs.enabled.matcher';

/**
 * This class represents a value object but cannot extends from BaseValueObject because it uses
 * this class and will generate a circular dependency.
 */
export class LoggerContext implements Printable {
  protected readonly _value: string;
  private readonly logsEnabledMatcher: LogsEnabledMatcher;

  constructor(value: string) {
    this.ensureValueIsDefined(value);
    this._value = value;
    this.logsEnabledMatcher = LogsEnabledMatcher.getInstance();
  }

  private ensureValueIsDefined(value: string): void {
    if (value === null || value === undefined) {
      // We don't throw an application error because it needs this class to log and will generate a circular dependency
      throw new Error(`Value must be defined. Found: ${value}`);
    }
  }

  public value(): string {
    return this._value;
  }

  public toString(): string {
    return this.value();
  }

  public areLogsEnabled(): boolean {
    return this.logsEnabledMatcher.isEnabled(this);
  }
}
