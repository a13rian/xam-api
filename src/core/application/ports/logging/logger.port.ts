export const LOGGER_SERVICE = Symbol('ILoggerService');

export interface LogMetadata {
  [key: string]: unknown;
}

export interface ILoggerService {
  /**
   * Create a child logger with a specific context (class/service name)
   */
  child(context: string): ILoggerService;

  /**
   * Log at info level
   */
  log(message: string, metadata?: LogMetadata): void;

  /**
   * Log at error level
   */
  error(message: string, metadata?: LogMetadata): void;
  error(message: string, trace: string, metadata?: LogMetadata): void;

  /**
   * Log at warn level
   */
  warn(message: string, metadata?: LogMetadata): void;

  /**
   * Log at debug level
   */
  debug(message: string, metadata?: LogMetadata): void;

  /**
   * Log at verbose/trace level
   */
  verbose(message: string, metadata?: LogMetadata): void;
}
