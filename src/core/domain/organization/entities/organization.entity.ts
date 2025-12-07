import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationCreatedEvent } from '../events/organization-created.event';

export interface OrganizationProps {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  settings?: Record<string, unknown>;
  isActive?: boolean;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrganizationProps {
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

export class Organization extends AggregateRoot {
  private readonly _id: string;
  private _name: string;
  private _slug: string;
  private _description: string | null;
  private _settings: Record<string, unknown>;
  private _isActive: boolean;
  private readonly _ownerId: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrganizationProps) {
    super();
    this._id = props.id || uuidv4();
    this._name = props.name;
    this._slug = props.slug;
    this._description = props.description ?? null;
    this._settings = props.settings ?? {};
    this._isActive = props.isActive ?? true;
    this._ownerId = props.ownerId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(props: CreateOrganizationProps): Organization {
    const org = new Organization({
      name: props.name,
      slug: props.slug,
      description: props.description,
      ownerId: props.ownerId,
    });

    org.apply(new OrganizationCreatedEvent(org.id, org.name, org.ownerId));
    return org;
  }

  public static reconstitute(props: OrganizationProps): Organization {
    return new Organization(props);
  }

  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  public update(props: { name?: string; description?: string }): void {
    if (props.name !== undefined) {
      this._name = props.name;
      this._slug = Organization.generateSlug(props.name);
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    this._updatedAt = new Date();
  }

  public updateSettings(settings: Record<string, unknown>): void {
    this._settings = { ...this._settings, ...settings };
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
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
  get description(): string | null {
    return this._description;
  }
  get settings(): Record<string, unknown> {
    return { ...this._settings };
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
