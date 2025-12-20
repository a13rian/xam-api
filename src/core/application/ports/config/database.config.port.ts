export interface IDatabaseConfig {
  readonly url: string;
  readonly synchronize: boolean;
  readonly logging: boolean;
  readonly ssl: boolean;
}
