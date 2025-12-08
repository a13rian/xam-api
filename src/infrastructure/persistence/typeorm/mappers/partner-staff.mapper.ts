import { Injectable } from '@nestjs/common';
import {
  PartnerStaff,
  PartnerStaffProps,
} from '../../../../core/domain/partner/entities/partner-staff.entity';
import { StaffRole } from '../../../../core/domain/partner/value-objects/staff-role.vo';
import { InvitationStatus } from '../../../../core/domain/partner/value-objects/invitation-status.vo';
import { PartnerStaffOrmEntity } from '../entities/partner-staff.orm-entity';

@Injectable()
export class PartnerStaffMapper {
  toDomain(orm: PartnerStaffOrmEntity): PartnerStaff {
    const props: PartnerStaffProps = {
      id: orm.id,
      partnerId: orm.partnerId,
      userId: orm.userId,
      email: orm.email,
      role: StaffRole.fromString(orm.role),
      invitationStatus: InvitationStatus.fromString(orm.invitationStatus),
      invitationToken: orm.invitationToken,
      invitedAt: orm.invitedAt,
      acceptedAt: orm.acceptedAt,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    };
    return PartnerStaff.reconstitute(props);
  }

  toOrmEntity(domain: PartnerStaff): PartnerStaffOrmEntity {
    const orm = new PartnerStaffOrmEntity();
    orm.id = domain.id;
    orm.partnerId = domain.partnerId;
    orm.userId = domain.userId;
    orm.email = domain.email;
    orm.role = domain.role.value;
    orm.invitationStatus = domain.invitationStatus.value;
    orm.invitationToken = domain.invitationToken;
    orm.invitedAt = domain.invitedAt;
    orm.acceptedAt = domain.acceptedAt;
    orm.isActive = domain.isActive;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
