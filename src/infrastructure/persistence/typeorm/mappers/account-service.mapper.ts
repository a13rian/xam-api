import { Injectable } from '@nestjs/common';
import { AccountService } from '../../../../core/domain/account-service/entities/account-service.entity';
import { AccountServiceOrmEntity } from '../entities/account-service.orm-entity';
import { Money } from '../../../../core/domain/shared/value-objects/money.vo';

@Injectable()
export class AccountServiceMapper {
  toDomain(ormEntity: AccountServiceOrmEntity): AccountService {
    return new AccountService({
      id: ormEntity.id,
      accountId: ormEntity.accountId,
      categoryId: ormEntity.categoryId,
      name: ormEntity.name,
      description: ormEntity.description,
      price: Money.create(
        Number(ormEntity.priceAmount),
        ormEntity.priceCurrency,
      ),
      durationMinutes: ormEntity.durationMinutes,
      isActive: ormEntity.isActive,
      sortOrder: ormEntity.sortOrder,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: AccountService): AccountServiceOrmEntity {
    const props = domain.toObject();
    const ormEntity = new AccountServiceOrmEntity();
    ormEntity.id = props.id;
    ormEntity.accountId = props.accountId;
    ormEntity.categoryId = props.categoryId;
    ormEntity.name = props.name;
    ormEntity.description = props.description;
    ormEntity.priceAmount = props.price;
    ormEntity.priceCurrency = props.currency;
    ormEntity.durationMinutes = props.durationMinutes;
    ormEntity.isActive = props.isActive;
    ormEntity.sortOrder = props.sortOrder;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
