export type UploadPurpose = 'avatar' | 'gallery' | 'cover' | 'document';
export type OwnerType = 'user' | 'account';

export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export class UploadFileCommand {
  constructor(
    public readonly file: FileData,
    public readonly ownerId: string,
    public readonly ownerType: OwnerType,
    public readonly purpose: UploadPurpose,
  ) {}
}
