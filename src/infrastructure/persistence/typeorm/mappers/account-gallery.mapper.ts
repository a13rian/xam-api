import { Injectable } from '@nestjs/common';
import { AccountGallery } from '../../../../core/domain/account/entities/account-gallery.entity';
import { AccountGalleryOrmEntity } from '../entities/account-gallery.orm-entity';

@Injectable()
export class AccountGalleryMapper {
  toDomain(entity: AccountGalleryOrmEntity): AccountGallery {
    return AccountGallery.reconstitute({
      id: entity.id,
      accountId: entity.accountId,
      imageUrl: entity.imageUrl,
      caption: entity.caption,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: AccountGallery): AccountGalleryOrmEntity {
    const entity = new AccountGalleryOrmEntity();
    entity.id = domain.id;
    entity.accountId = domain.accountId;
    entity.imageUrl = domain.imageUrl;
    entity.caption = domain.caption;
    entity.sortOrder = domain.sortOrder;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  toDomainList(entities: AccountGalleryOrmEntity[]): AccountGallery[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}
