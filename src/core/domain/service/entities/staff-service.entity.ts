import { v4 as uuidv4 } from 'uuid';

export interface StaffServiceProps {
  id: string;
  staffId: string;
  serviceId: string;
  createdAt: Date;
}

export class StaffService {
  private readonly _id: string;
  private readonly _staffId: string;
  private readonly _serviceId: string;
  private readonly _createdAt: Date;

  private constructor(props: StaffServiceProps) {
    this._id = props.id;
    this._staffId = props.staffId;
    this._serviceId = props.serviceId;
    this._createdAt = props.createdAt;
  }

  static create(props: { staffId: string; serviceId: string }): StaffService {
    return new StaffService({
      id: uuidv4(),
      staffId: props.staffId,
      serviceId: props.serviceId,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: StaffServiceProps): StaffService {
    return new StaffService(props);
  }

  get id(): string {
    return this._id;
  }

  get staffId(): string {
    return this._staffId;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
