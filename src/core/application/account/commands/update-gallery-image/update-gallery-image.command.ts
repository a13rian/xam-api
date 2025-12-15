export class UpdateGalleryImageCommand {
  constructor(
    public readonly accountId: string,
    public readonly galleryId: string,
    public readonly imageUrl?: string,
    public readonly caption?: string | null,
  ) {}
}
