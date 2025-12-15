export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export class UpdateUserAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly file: FileData,
  ) {}
}
