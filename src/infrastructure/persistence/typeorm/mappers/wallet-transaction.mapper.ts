import { Injectable } from '@nestjs/common';
import { WalletTransaction } from '../../../../core/domain/wallet/entities/wallet-transaction.entity';
import { Money } from '../../../../core/domain/shared/value-objects/money.vo';
import { TransactionType } from '../../../../core/domain/wallet/value-objects/transaction-type.vo';
import { WalletTransactionOrmEntity } from '../entities/wallet-transaction.orm-entity';

@Injectable()
export class WalletTransactionMapper {
  toDomain(entity: WalletTransactionOrmEntity): WalletTransaction {
    return WalletTransaction.reconstitute({
      id: entity.id,
      walletId: entity.walletId,
      type: TransactionType.fromString(entity.type),
      amount: Money.create(Number(entity.amount), entity.currency),
      balanceAfter: Money.create(Number(entity.balanceAfter), entity.currency),
      referenceType: entity.referenceType,
      referenceId: entity.referenceId,
      description: entity.description,
      createdAt: entity.createdAt,
    });
  }

  toPersistence(domain: WalletTransaction): WalletTransactionOrmEntity {
    const entity = new WalletTransactionOrmEntity();
    entity.id = domain.id;
    entity.walletId = domain.walletId;
    entity.type = domain.typeValue;
    entity.amount = domain.amount.amount;
    entity.balanceAfter = domain.balanceAfter.amount;
    entity.currency = domain.amount.currency;
    entity.referenceType = domain.referenceType;
    entity.referenceId = domain.referenceId;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt;
    return entity;
  }
}
