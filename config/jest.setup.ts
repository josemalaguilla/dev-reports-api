import { Logger } from '@nestjs/common';

silentLoggers()

function silentLoggers(): void {
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});
  global.console.log = jest.fn();
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
  global.console.debug = jest.fn();
  global.console.info = jest.fn();
}
