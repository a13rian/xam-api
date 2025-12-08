import { v4 as uuidv4 } from 'uuid';

export enum DocumentTypeEnum {
  BUSINESS_LICENSE = 'business_license',
  ID_CARD = 'id_card',
  TAX_CERTIFICATE = 'tax_certificate',
  OTHER = 'other',
}

export enum DocumentStatusEnum {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface PartnerDocumentProps {
  id?: string;
  partnerId: string;
  type: DocumentTypeEnum;
  url: string;
  status?: DocumentStatusEnum;
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  createdAt?: Date;
}

export interface CreateDocumentProps {
  partnerId: string;
  type: DocumentTypeEnum;
  url: string;
}

export class PartnerDocument {
  private readonly _id: string;
  private readonly _partnerId: string;
  private readonly _type: DocumentTypeEnum;
  private readonly _url: string;
  private _status: DocumentStatusEnum;
  private _rejectionReason: string | null;
  private _reviewedAt: Date | null;
  private _reviewedBy: string | null;
  private readonly _createdAt: Date;

  private constructor(props: PartnerDocumentProps) {
    this._id = props.id || uuidv4();
    this._partnerId = props.partnerId;
    this._type = props.type;
    this._url = props.url;
    this._status = props.status ?? DocumentStatusEnum.PENDING;
    this._rejectionReason = props.rejectionReason ?? null;
    this._reviewedAt = props.reviewedAt ?? null;
    this._reviewedBy = props.reviewedBy ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  public static create(props: CreateDocumentProps): PartnerDocument {
    return new PartnerDocument({
      partnerId: props.partnerId,
      type: props.type,
      url: props.url,
    });
  }

  public static reconstitute(props: PartnerDocumentProps): PartnerDocument {
    return new PartnerDocument(props);
  }

  public approve(reviewedBy: string): void {
    this._status = DocumentStatusEnum.APPROVED;
    this._reviewedAt = new Date();
    this._reviewedBy = reviewedBy;
    this._rejectionReason = null;
  }

  public reject(reviewedBy: string, reason: string): void {
    this._status = DocumentStatusEnum.REJECTED;
    this._reviewedAt = new Date();
    this._reviewedBy = reviewedBy;
    this._rejectionReason = reason;
  }

  public isPending(): boolean {
    return this._status === DocumentStatusEnum.PENDING;
  }

  public isApproved(): boolean {
    return this._status === DocumentStatusEnum.APPROVED;
  }

  public isRejected(): boolean {
    return this._status === DocumentStatusEnum.REJECTED;
  }

  get id(): string {
    return this._id;
  }

  get partnerId(): string {
    return this._partnerId;
  }

  get type(): DocumentTypeEnum {
    return this._type;
  }

  get url(): string {
    return this._url;
  }

  get status(): DocumentStatusEnum {
    return this._status;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  get reviewedBy(): string | null {
    return this._reviewedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
