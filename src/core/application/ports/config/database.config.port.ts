export interface IDatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly name: string;
  readonly synchronize: boolean;
  readonly logging: boolean;
  readonly ssl: boolean;
}
