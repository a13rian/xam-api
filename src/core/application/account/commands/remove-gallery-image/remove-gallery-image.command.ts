export class RemoveGalleryImageCommand {
  constructor(
    public readonly accountId: string,
    public readonly galleryId: string,
  ) {}
}
