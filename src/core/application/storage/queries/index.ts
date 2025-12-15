export * from './get-presigned-url/get-presigned-url.query';
export * from './get-presigned-url/get-presigned-url.handler';

import { GetPresignedUrlHandler } from './get-presigned-url/get-presigned-url.handler';

export const StorageQueryHandlers = [GetPresignedUrlHandler];
