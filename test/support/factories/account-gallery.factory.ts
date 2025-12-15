import { DatabaseHelper } from '../database/database.helper';
import { AccountGalleryOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/account-gallery.orm-entity';

export interface CreateAccountGalleryOptions {
  accountId: string;
  imageUrl?: string;
  caption?: string | null;
  sortOrder?: number;
}

export interface CreatedAccountGallery {
  id: string;
  accountId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

let galleryCounter = 0;

export class AccountGalleryFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(
    options: CreateAccountGalleryOptions,
  ): Promise<CreatedAccountGallery> {
    galleryCounter++;
    const galleryRepo = this.db.getRepository(AccountGalleryOrmEntity);

    const gallery = galleryRepo.create({
      id: this.generateGalleryId(),
      accountId: options.accountId,
      imageUrl:
        options.imageUrl ?? `https://example.com/gallery/${galleryCounter}.jpg`,
      caption: options.caption ?? null,
      sortOrder: options.sortOrder ?? 0,
    });

    await galleryRepo.save(gallery);

    return {
      id: gallery.id,
      accountId: gallery.accountId,
      imageUrl: gallery.imageUrl,
      caption: gallery.caption,
      sortOrder: gallery.sortOrder,
    };
  }

  async createMany(
    accountId: string,
    count: number,
    baseOptions: Partial<CreateAccountGalleryOptions> = {},
  ): Promise<CreatedAccountGallery[]> {
    const galleries: CreatedAccountGallery[] = [];
    for (let i = 0; i < count; i++) {
      const gallery = await this.create({
        accountId,
        sortOrder: i,
        ...baseOptions,
      });
      galleries.push(gallery);
    }
    return galleries;
  }

  async createWithCaption(
    accountId: string,
    caption: string,
    options: Partial<CreateAccountGalleryOptions> = {},
  ): Promise<CreatedAccountGallery> {
    return this.create({
      accountId,
      caption,
      ...options,
    });
  }

  private generateGalleryId(): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = 'gal_';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
