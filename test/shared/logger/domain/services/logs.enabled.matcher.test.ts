import { LogsEnabledMatcher } from '../../../../../src/shared/logger/domain/services/logs.enabled.matcher';
import { LoggerContext } from '../../../../../src/shared/logger/domain/value-objects/logger.context';

describe('LogsEnabledMatcher', () => {
  beforeEach(() => {
    resetSingletonInstance();
  });

  describe('initialize', () => {
    it('should create instance with default wildcard when no parameter is provided', () => {
      LogsEnabledMatcher.initialize();
      const instance = LogsEnabledMatcher.getInstance();

      expectToMatchContext(new LoggerContext('any.context'), instance);
    });

    it('should not recreate instance if already initialized', () => {
      const consoleSpy = jest.spyOn(console, 'warn');

      LogsEnabledMatcher.initialize('test.*');
      LogsEnabledMatcher.initialize('other.*');

      expectToWarnAboutAlreadyInitialized(consoleSpy);
    });
  });

  describe('getInstance', () => {
    it('should initialize with default value if instance does not exist', () => {
      const instance = LogsEnabledMatcher.getInstance();
      expect(instance).toBeInstanceOf(LogsEnabledMatcher);
    });

    it('should return the same singleton instance', () => {
      LogsEnabledMatcher.initialize('test.*');
      const instance1 = LogsEnabledMatcher.getInstance();
      const instance2 = LogsEnabledMatcher.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('isEnabled', () => {
    it('should match exact context', () => {
      LogsEnabledMatcher.initialize('test.context');
      const instance = LogsEnabledMatcher.getInstance();

      const context = new LoggerContext('test.context');
      expectToMatchContext(context, instance);
    });

    it('should match wildcard pattern', () => {
      LogsEnabledMatcher.initialize('test.*');
      const instance = LogsEnabledMatcher.getInstance();

      const context = new LoggerContext('test.anything');
      expectToMatchContext(context, instance);
    });

    it('should match multiple patterns', () => {
      LogsEnabledMatcher.initialize('test.*, other.context');
      const instance = LogsEnabledMatcher.getInstance();

      const testContext = new LoggerContext('test.something');
      const otherContext = new LoggerContext('other.context');
      const unrelatedContext = new LoggerContext('unrelated.context');

      expectToMatchContext(testContext, instance);
      expectToMatchContext(otherContext, instance);
      expectToNotMatchContext(unrelatedContext, instance);
    });

    it('should handle special regex characters in context', () => {
      LogsEnabledMatcher.initialize('test.special.*');
      const instance = LogsEnabledMatcher.getInstance();

      const context = new LoggerContext('test.special.$context');
      expectToMatchContext(context, instance);
    });
  });

  function resetSingletonInstance() {
    (LogsEnabledMatcher as any).instance = undefined;
  }

  function expectToWarnAboutAlreadyInitialized(consoleSpy: jest.SpyInstance) {
    expect(consoleSpy).toHaveBeenCalledWith(
      'LogsEnabledMatcher already initialized',
    );
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  }

  function expectToMatchContext(
    context: LoggerContext,
    matcher: LogsEnabledMatcher,
  ) {
    expect(matcher.isEnabled(context)).toBe(true);
  }

  function expectToNotMatchContext(
    context: LoggerContext,
    matcher: LogsEnabledMatcher,
  ) {
    expect(matcher.isEnabled(context)).toBe(false);
  }
});
