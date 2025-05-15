import { LoggerContext } from '../value-objects/logger.context';

export class LogsEnabledMatcher {
  private readonly enabledLogsWildcards: string[] = [];
  private static instance: LogsEnabledMatcher;

  private constructor(enabledLogs: string) {
    this.enabledLogsWildcards = enabledLogs.split(',');
  }

  public static initialize(enabledLogs: string = '*'): void {
    if (this.instance) {
      // We use the standard output logger because logger instance is not initialized yet
      console.warn('LogsEnabledMatcher already initialized');
      return;
    }
    this.instance = new LogsEnabledMatcher(enabledLogs);
  }

  public static getInstance(): LogsEnabledMatcher {
    if (!this.instance) this.initialize();
    return this.instance;
  }

  public isEnabled(context: LoggerContext): boolean {
    return this.enabledLogsWildcards.some((wildcard) =>
      this.matchesWildcard(wildcard.trim(), context.value()),
    );
  }

  private matchesWildcard(wildcard: string, value: string): boolean {
    const regex = new RegExp(
      '^' +
        wildcard.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') +
        '$',
    );

    return regex.test(value);
  }
}
