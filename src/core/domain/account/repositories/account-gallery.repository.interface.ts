import { AccountGallery } from '../entities/account-gallery.entity';

export const ACCOUNT_GALLERY_REPOSITORY = Symbol('IAccountGalleryRepository');

export interface IAccountGalleryRepository {
  findById(id: string): Promise<AccountGallery | null>;
  findByAccountId(accountId: string): Promise<AccountGallery[]>;
  save(gallery: AccountGallery): Promise<void>;
  saveMany(galleries: AccountGallery[]): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByAccountId(accountId: string): Promise<void>;
  countByAccountId(accountId: string): Promise<number>;
  updateSortOrders(items: { id: string; sortOrder: number }[]): Promise<void>;
}
