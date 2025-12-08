export interface IAppConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly appName: string;
  readonly apiPrefix: string;
  readonly apiVersion: string;
  readonly corsOrigins: string[];
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
}
