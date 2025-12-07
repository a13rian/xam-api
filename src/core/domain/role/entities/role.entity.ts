import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { RoleCreatedEvent } from '../events/role-created.event';

export interface RoleProps {
  id?: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  organizationId?: string | null;
  permissionIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role extends AggregateRoot {
  private readonly _id: string;
  private _name: string;
  private _description: string | null;
  private readonly _isSystem: boolean;
  private readonly _organizationId: string | null;
  private _permissionIds: string[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: RoleProps) {
    super();
    this._id = props.id || uuidv4();
    this._name = props.name;
    this._description = props.description ?? null;
    this._isSystem = props.isSystem ?? false;
    this._organizationId = props.organizationId ?? null;
    this._permissionIds = props.permissionIds ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(
    props: Omit<RoleProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Role {
    const role = new Role(props);
    role.apply(new RoleCreatedEvent(role.id, role.name, role.organizationId));
    return role;
  }

  public static reconstitute(props: RoleProps): Role {
    return new Role(props);
  }

  public update(props: { name?: string; description?: string }): void {
    if (this._isSystem) {
      throw new Error('Cannot modify system roles');
    }
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    this._updatedAt = new Date();
  }

  public assignPermission(permissionId: string): void {
    if (!this._permissionIds.includes(permissionId)) {
      this._permissionIds.push(permissionId);
      this._updatedAt = new Date();
    }
  }

  public addPermission(permissionId: string): void {
    this.assignPermission(permissionId);
  }

  public removePermission(permissionId: string): void {
    this._permissionIds = this._permissionIds.filter(
      (id) => id !== permissionId,
    );
    this._updatedAt = new Date();
  }

  public setPermissions(permissionIds: string[]): void {
    this._permissionIds = [...permissionIds];
    this._updatedAt = new Date();
  }

  public hasPermission(permissionId: string): boolean {
    return this._permissionIds.includes(permissionId);
  }

  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get isSystem(): boolean {
    return this._isSystem;
  }
  get organizationId(): string | null {
    return this._organizationId;
  }
  get permissionIds(): readonly string[] {
    return [...this._permissionIds];
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
