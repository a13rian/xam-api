import { v4 as uuidv4 } from 'uuid';

export interface PermissionProps {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
  createdAt?: Date;
}

export class Permission {
  private readonly _id: string;
  private readonly _code: string;
  private _name: string;
  private _description: string | null;
  private readonly _resource: string;
  private readonly _action: string;
  private readonly _createdAt: Date;

  private constructor(props: PermissionProps) {
    this._id = props.id || uuidv4();
    this._code = props.code;
    this._name = props.name;
    this._description = props.description ?? null;
    this._resource = props.resource;
    this._action = props.action;
    this._createdAt = props.createdAt ?? new Date();
  }

  public static create(
    props: Omit<PermissionProps, 'id' | 'code' | 'createdAt'>,
  ): Permission {
    const code = `${props.resource}:${props.action}`;
    return new Permission({
      ...props,
      code,
    });
  }

  public static reconstitute(props: PermissionProps): Permission {
    return new Permission(props);
  }

  get id(): string {
    return this._id;
  }
  get code(): string {
    return this._code;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get resource(): string {
    return this._resource;
  }
  get action(): string {
    return this._action;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
}
