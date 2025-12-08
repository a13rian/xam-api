export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface ILoggerConfig {
  readonly level: LogLevel;
  readonly prettyPrint: boolean;
}
