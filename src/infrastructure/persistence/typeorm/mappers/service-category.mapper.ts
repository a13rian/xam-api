import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '../../../../core/domain/service/entities/service-category.entity';
import { ServiceCategoryOrmEntity } from '../entities/service-category.orm-entity';

@Injectable()
export class ServiceCategoryMapper {
  toDomain(ormEntity: ServiceCategoryOrmEntity): ServiceCategory {
    return new ServiceCategory({
      id: ormEntity.id,
      name: ormEntity.name,
      slug: ormEntity.slug,
      description: ormEntity.description,
      parentId: ormEntity.parentId,
      iconUrl: ormEntity.iconUrl,
      sortOrder: ormEntity.sortOrder,
      isActive: ormEntity.isActive,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  toOrm(domain: ServiceCategory): ServiceCategoryOrmEntity {
    const props = domain.toObject();
    const ormEntity = new ServiceCategoryOrmEntity();
    ormEntity.id = props.id;
    ormEntity.name = props.name;
    ormEntity.slug = props.slug;
    ormEntity.description = props.description;
    ormEntity.parentId = props.parentId;
    ormEntity.iconUrl = props.iconUrl;
    ormEntity.sortOrder = props.sortOrder;
    ormEntity.isActive = props.isActive;
    ormEntity.createdAt = props.createdAt;
    ormEntity.updatedAt = props.updatedAt;
    return ormEntity;
  }
}
