import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../shared/value-objects/money.vo';
import {
  TransactionType,
  TransactionTypeEnum,
} from '../value-objects/transaction-type.vo';

export interface WalletTransactionProps {
  id?: string;
  walletId: string;
  type: TransactionType;
  amount: Money;
  balanceAfter: Money;
  referenceType?: string | null;
  referenceId?: string | null;
  description: string;
  createdAt?: Date;
}

export interface CreateTransactionProps {
  walletId: string;
  type: TransactionType;
  amount: Money;
  balanceAfter: Money;
  referenceType?: string;
  referenceId?: string;
  description: string;
}

export class WalletTransaction {
  private readonly _id: string;
  private readonly _walletId: string;
  private readonly _type: TransactionType;
  private readonly _amount: Money;
  private readonly _balanceAfter: Money;
  private readonly _referenceType: string | null;
  private readonly _referenceId: string | null;
  private readonly _description: string;
  private readonly _createdAt: Date;

  private constructor(props: WalletTransactionProps) {
    this._id = props.id || uuidv4();
    this._walletId = props.walletId;
    this._type = props.type;
    this._amount = props.amount;
    this._balanceAfter = props.balanceAfter;
    this._referenceType = props.referenceType ?? null;
    this._referenceId = props.referenceId ?? null;
    this._description = props.description;
    this._createdAt = props.createdAt ?? new Date();
  }

  public static create(props: CreateTransactionProps): WalletTransaction {
    return new WalletTransaction({
      walletId: props.walletId,
      type: props.type,
      amount: props.amount,
      balanceAfter: props.balanceAfter,
      referenceType: props.referenceType,
      referenceId: props.referenceId,
      description: props.description,
    });
  }

  public static reconstitute(props: WalletTransactionProps): WalletTransaction {
    return new WalletTransaction(props);
  }

  public isCredit(): boolean {
    return this._type.isCredit();
  }

  public isDebit(): boolean {
    return this._type.isDebit();
  }

  get id(): string {
    return this._id;
  }

  get walletId(): string {
    return this._walletId;
  }

  get type(): TransactionType {
    return this._type;
  }

  get typeValue(): TransactionTypeEnum {
    return this._type.value;
  }

  get amount(): Money {
    return this._amount;
  }

  get balanceAfter(): Money {
    return this._balanceAfter;
  }

  get referenceType(): string | null {
    return this._referenceType;
  }

  get referenceId(): string | null {
    return this._referenceId;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
