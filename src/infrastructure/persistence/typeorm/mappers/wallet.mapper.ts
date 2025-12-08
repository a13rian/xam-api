import { Injectable } from '@nestjs/common';
import { Wallet } from '../../../../core/domain/wallet/entities/wallet.entity';
import { Money } from '../../../../core/domain/shared/value-objects/money.vo';
import { WalletOrmEntity } from '../entities/wallet.orm-entity';

@Injectable()
export class WalletMapper {
  toDomain(entity: WalletOrmEntity): Wallet {
    return Wallet.reconstitute({
      id: entity.id,
      userId: entity.userId,
      balance: Money.create(Number(entity.balance), entity.currency),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Wallet): WalletOrmEntity {
    const entity = new WalletOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.balance = domain.balance.amount;
    entity.currency = domain.balance.currency;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
