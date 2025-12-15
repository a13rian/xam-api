export class AddGalleryImageCommand {
  constructor(
    public readonly accountId: string,
    public readonly imageUrl: string,
    public readonly caption?: string,
    public readonly sortOrder?: number,
    public readonly storageKey?: string,
  ) {}
}
