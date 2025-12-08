import { Injectable } from '@nestjs/common';
import {
  StaffService,
  StaffServiceProps,
} from '../../../../core/domain/service/entities/staff-service.entity';
import { StaffServiceOrmEntity } from '../entities/staff-service.orm-entity';

@Injectable()
export class StaffServiceMapper {
  toDomain(orm: StaffServiceOrmEntity): StaffService {
    const props: StaffServiceProps = {
      id: orm.id,
      staffId: orm.staffId,
      serviceId: orm.serviceId,
      createdAt: orm.createdAt,
    };
    return StaffService.reconstitute(props);
  }

  toOrmEntity(domain: StaffService): StaffServiceOrmEntity {
    const orm = new StaffServiceOrmEntity();
    orm.id = domain.id;
    orm.staffId = domain.staffId;
    orm.serviceId = domain.serviceId;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
