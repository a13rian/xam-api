export interface GalleryItemOrder {
  id: string;
  sortOrder: number;
}

export class ReorderGalleryImagesCommand {
  constructor(
    public readonly accountId: string,
    public readonly items: GalleryItemOrder[],
  ) {}
}
