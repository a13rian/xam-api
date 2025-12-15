export * from './upload-file/upload-file.command';
export * from './upload-file/upload-file.handler';
export * from './delete-file/delete-file.command';
export * from './delete-file/delete-file.handler';

import { UploadFileHandler } from './upload-file/upload-file.handler';
import { DeleteFileHandler } from './delete-file/delete-file.handler';

export const StorageCommandHandlers = [UploadFileHandler, DeleteFileHandler];
