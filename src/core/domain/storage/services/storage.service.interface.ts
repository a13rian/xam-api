export interface UploadFileOptions {
  bucketName: string;
  key: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
  isPublic?: boolean;
}

export interface GetPresignedUrlOptions {
  bucketName: string;
  key: string;
  expiresIn?: number; // seconds, default 3600
  operation: 'get' | 'put';
}

export interface DeleteFileOptions {
  bucketName: string;
  key: string;
}

export interface FileExistsOptions {
  bucketName: string;
  key: string;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  etag: string;
  size: number;
}

export interface IStorageService {
  // Bucket operations
  ensureBucketExists(bucketName: string, isPublic?: boolean): Promise<void>;
  bucketExists(bucketName: string): Promise<boolean>;

  // File operations
  uploadFile(options: UploadFileOptions): Promise<UploadResult>;
  deleteFile(options: DeleteFileOptions): Promise<void>;
  fileExists(options: FileExistsOptions): Promise<boolean>;

  // URL generation
  getPresignedUrl(options: GetPresignedUrlOptions): Promise<string>;
  getPublicUrl(bucketName: string, key: string): string;
}
