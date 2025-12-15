export class DeleteFileCommand {
  constructor(
    public readonly bucket: string,
    public readonly key: string,
  ) {}
}
