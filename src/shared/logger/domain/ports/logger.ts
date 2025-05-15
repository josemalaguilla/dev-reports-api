export interface Logger {
  log(message: string, ...optionalParams: any[]): void;
  error(message: string, ...optionalParams: any[]): void;
  warn(message: string, ...optionalParams: any[]): void;
  debug(message: string, ...optionalParams: any[]): void;
  verbose(message: string, ...optionalParams: any[]): void;
}
