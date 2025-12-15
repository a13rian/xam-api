import { v4 as uuidv4 } from 'uuid';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface AccountGalleryProps {
  id: string;
  accountId: string;
  imageUrl: string;
  caption?: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountGalleryProps {
  accountId: string;
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
}

export class AccountGallery {
  private readonly _id: string;
  private readonly _accountId: string;
  private _imageUrl: string;
  private _caption: string | null;
  private _sortOrder: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AccountGalleryProps) {
    this._id = props.id;
    this._accountId = props.accountId;
    this._imageUrl = props.imageUrl;
    this._caption = props.caption ?? null;
    this._sortOrder = props.sortOrder;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CreateAccountGalleryProps): AccountGallery {
    if (!props.imageUrl || props.imageUrl.trim().length === 0) {
      throw new ValidationException('Image URL is required');
    }

    const now = new Date();
    return new AccountGallery({
      id: `gal_${uuidv4()}`,
      accountId: props.accountId,
      imageUrl: props.imageUrl.trim(),
      caption: props.caption?.trim() ?? null,
      sortOrder: props.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: AccountGalleryProps): AccountGallery {
    return new AccountGallery(props);
  }

  updateImage(imageUrl: string): void {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new ValidationException('Image URL is required');
    }
    this._imageUrl = imageUrl.trim();
    this._updatedAt = new Date();
  }

  updateCaption(caption: string | null): void {
    this._caption = caption?.trim() ?? null;
    this._updatedAt = new Date();
  }

  updateSortOrder(sortOrder: number): void {
    if (sortOrder < 0) {
      throw new ValidationException('Sort order cannot be negative');
    }
    this._sortOrder = sortOrder;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get accountId(): string {
    return this._accountId;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get caption(): string | null {
    return this._caption;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  toObject(): Record<string, unknown> {
    return {
      id: this._id,
      accountId: this._accountId,
      imageUrl: this._imageUrl,
      caption: this._caption,
      sortOrder: this._sortOrder,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
