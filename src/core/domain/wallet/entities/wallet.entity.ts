import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../shared/value-objects/money.vo';
import { WalletTransaction } from './wallet-transaction.entity';
import { TransactionType } from '../value-objects/transaction-type.vo';
import { WalletCreatedEvent } from '../events/wallet-created.event';
import { WalletCreditedEvent } from '../events/wallet-credited.event';
import { WalletDebitedEvent } from '../events/wallet-debited.event';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export interface WalletProps {
  id?: string;
  userId: string;
  balance: Money;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Wallet extends AggregateRoot {
  private readonly _id: string;
  private readonly _userId: string;
  private _balance: Money;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: WalletProps) {
    super();
    this._id = props.id || uuidv4();
    this._userId = props.userId;
    this._balance = props.balance;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public static create(userId: string, currency: string = 'VND'): Wallet {
    const wallet = new Wallet({
      userId,
      balance: Money.zero(currency),
    });

    wallet.apply(new WalletCreatedEvent(wallet.id, userId, currency));
    return wallet;
  }

  public static reconstitute(props: WalletProps): Wallet {
    return new Wallet(props);
  }

  public deposit(amount: Money, description: string): WalletTransaction {
    if (amount.isZero()) {
      throw new ValidationException('Deposit amount must be greater than zero');
    }

    const newBalance = this._balance.add(amount);
    this._balance = newBalance;
    this._updatedAt = new Date();

    const transaction = WalletTransaction.create({
      walletId: this._id,
      type: TransactionType.deposit(),
      amount,
      balanceAfter: newBalance,
      description,
    });

    this.apply(
      new WalletCreditedEvent(
        this._id,
        this._userId,
        amount.amount,
        amount.currency,
      ),
    );
    return transaction;
  }

  public withdraw(amount: Money, description: string): WalletTransaction {
    if (amount.isZero()) {
      throw new ValidationException(
        'Withdrawal amount must be greater than zero',
      );
    }
    if (!this.hasSufficientBalance(amount)) {
      throw new ValidationException('Insufficient balance');
    }

    const newBalance = this._balance.subtract(amount);
    this._balance = newBalance;
    this._updatedAt = new Date();

    const transaction = WalletTransaction.create({
      walletId: this._id,
      type: TransactionType.withdrawal(),
      amount,
      balanceAfter: newBalance,
      description,
    });

    this.apply(
      new WalletDebitedEvent(
        this._id,
        this._userId,
        amount.amount,
        amount.currency,
      ),
    );
    return transaction;
  }

  public pay(
    amount: Money,
    bookingId: string,
    description: string,
  ): WalletTransaction {
    if (amount.isZero()) {
      throw new ValidationException('Payment amount must be greater than zero');
    }
    if (!this.hasSufficientBalance(amount)) {
      throw new ValidationException('Insufficient balance for payment');
    }

    const newBalance = this._balance.subtract(amount);
    this._balance = newBalance;
    this._updatedAt = new Date();

    const transaction = WalletTransaction.create({
      walletId: this._id,
      type: TransactionType.payment(),
      amount,
      balanceAfter: newBalance,
      referenceType: 'booking',
      referenceId: bookingId,
      description,
    });

    this.apply(
      new WalletDebitedEvent(
        this._id,
        this._userId,
        amount.amount,
        amount.currency,
      ),
    );
    return transaction;
  }

  public refund(
    amount: Money,
    bookingId: string,
    description: string,
  ): WalletTransaction {
    if (amount.isZero()) {
      throw new ValidationException('Refund amount must be greater than zero');
    }

    const newBalance = this._balance.add(amount);
    this._balance = newBalance;
    this._updatedAt = new Date();

    const transaction = WalletTransaction.create({
      walletId: this._id,
      type: TransactionType.refund(),
      amount,
      balanceAfter: newBalance,
      referenceType: 'booking',
      referenceId: bookingId,
      description,
    });

    this.apply(
      new WalletCreditedEvent(
        this._id,
        this._userId,
        amount.amount,
        amount.currency,
      ),
    );
    return transaction;
  }

  public hasSufficientBalance(amount: Money): boolean {
    return this._balance.isGreaterThanOrEqual(amount);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get balance(): Money {
    return this._balance;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
