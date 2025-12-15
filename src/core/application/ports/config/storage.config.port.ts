export interface IStorageConfig {
  readonly endpoint: string;
  readonly port: number;
  readonly useSSL: boolean;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly region: string;
  readonly publicUrl: string | null;
  readonly maxFileSize: number;
  readonly buckets: {
    readonly avatars: string;
    readonly gallery: string;
  };
}
