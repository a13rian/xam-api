export interface BookingServiceProps {
  id: string;
  bookingId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  currency: string;
  durationMinutes: number;
}

export class BookingService {
  private readonly _id: string;
  private readonly _bookingId: string;
  private readonly _serviceId: string;
  private readonly _serviceName: string;
  private readonly _price: number;
  private readonly _currency: string;
  private readonly _durationMinutes: number;

  constructor(props: BookingServiceProps) {
    this._id = props.id;
    this._bookingId = props.bookingId;
    this._serviceId = props.serviceId;
    this._serviceName = props.serviceName;
    this._price = props.price;
    this._currency = props.currency;
    this._durationMinutes = props.durationMinutes;
  }

  get id(): string {
    return this._id;
  }

  get bookingId(): string {
    return this._bookingId;
  }

  get serviceId(): string {
    return this._serviceId;
  }

  get serviceName(): string {
    return this._serviceName;
  }

  get price(): number {
    return this._price;
  }

  get currency(): string {
    return this._currency;
  }

  get durationMinutes(): number {
    return this._durationMinutes;
  }

  static create(props: {
    id: string;
    bookingId: string;
    serviceId: string;
    serviceName: string;
    price: number;
    currency: string;
    durationMinutes: number;
  }): BookingService {
    return new BookingService(props);
  }

  toObject(): BookingServiceProps {
    return {
      id: this._id,
      bookingId: this._bookingId,
      serviceId: this._serviceId,
      serviceName: this._serviceName,
      price: this._price,
      currency: this._currency,
      durationMinutes: this._durationMinutes,
    };
  }
}
