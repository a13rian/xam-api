import { Injectable } from '@nestjs/common';
import { Account } from '../../../../core/domain/account/entities/account.entity';
import { AccountType } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRole } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatus } from '../../../../core/domain/account/value-objects/account-status.vo';
import { InvitationStatus } from '../../../../core/domain/account/value-objects/invitation-status.vo';
import { AccountOrmEntity } from '../entities/account.orm-entity';

@Injectable()
export class AccountMapper {
  toDomain(entity: AccountOrmEntity): Account {
    return Account.reconstitute({
      id: entity.id,
      userId: entity.userId,
      organizationId: entity.organizationId,
      type: AccountType.fromString(entity.type),
      role: entity.role ? AccountRole.fromString(entity.role) : null,
      displayName: entity.displayName,
      specialization: entity.specialization,
      yearsExperience: entity.yearsExperience,
      certifications: entity.certifications,
      portfolio: entity.portfolio,
      personalBio: entity.personalBio,
      status: AccountStatus.fromString(entity.status),
      invitationStatus: entity.invitationStatus
        ? InvitationStatus.fromString(entity.invitationStatus)
        : null,
      invitationToken: entity.invitationToken,
      invitedAt: entity.invitedAt,
      acceptedAt: entity.acceptedAt,
      isActive: entity.isActive,
      approvedAt: entity.approvedAt,
      approvedBy: entity.approvedBy,
      rejectionReason: entity.rejectionReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Account): AccountOrmEntity {
    const entity = new AccountOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.organizationId = domain.organizationId;
    entity.type = domain.typeValue;
    entity.role = domain.roleValue;
    entity.displayName = domain.displayName;
    entity.specialization = domain.specialization;
    entity.yearsExperience = domain.yearsExperience;
    entity.certifications = domain.certifications;
    entity.portfolio = domain.portfolio;
    entity.personalBio = domain.personalBio;
    entity.status = domain.statusValue;
    entity.invitationStatus = domain.invitationStatusValue;
    entity.invitationToken = domain.invitationToken;
    entity.invitedAt = domain.invitedAt;
    entity.acceptedAt = domain.acceptedAt;
    entity.isActive = domain.isActive;
    entity.approvedAt = domain.approvedAt;
    entity.approvedBy = domain.approvedBy;
    entity.rejectionReason = domain.rejectionReason;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
