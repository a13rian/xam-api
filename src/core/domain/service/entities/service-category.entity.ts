import { AggregateRoot } from '@nestjs/cqrs';

export interface ServiceCategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ServiceCategory extends AggregateRoot {
  private readonly _id: string;
  private _name: string;
  private _slug: string;
  private _description?: string;
  private _parentId?: string;
  private _iconUrl?: string;
  private _sortOrder: number;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ServiceCategoryProps) {
    super();
    this._id = props.id;
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description;
    this._parentId = props.parentId;
    this._iconUrl = props.iconUrl;
    this._sortOrder = props.sortOrder;
    this._isActive = props.isActive;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get description(): string | undefined {
    return this._description;
  }

  get parentId(): string | undefined {
    return this._parentId;
  }

  get iconUrl(): string | undefined {
    return this._iconUrl;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    iconUrl?: string;
    sortOrder?: number;
  }): ServiceCategory {
    const now = new Date();
    return new ServiceCategory({
      id: props.id,
      name: props.name,
      slug: props.slug,
      description: props.description,
      parentId: props.parentId,
      iconUrl: props.iconUrl,
      sortOrder: props.sortOrder ?? 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(props: {
    name?: string;
    slug?: string;
    description?: string;
    iconUrl?: string;
    sortOrder?: number;
  }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.slug !== undefined) {
      this._slug = props.slug;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.iconUrl !== undefined) {
      this._iconUrl = props.iconUrl;
    }
    if (props.sortOrder !== undefined) {
      this._sortOrder = props.sortOrder;
    }
    this._updatedAt = new Date();
  }

  moveTo(parentId: string | null): void {
    this._parentId = parentId ?? undefined;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toObject(): ServiceCategoryProps {
    return {
      id: this._id,
      name: this._name,
      slug: this._slug,
      description: this._description,
      parentId: this._parentId,
      iconUrl: this._iconUrl,
      sortOrder: this._sortOrder,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
