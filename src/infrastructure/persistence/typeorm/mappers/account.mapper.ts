import { Injectable } from '@nestjs/common';
import { Account } from '../../../../core/domain/account/entities/account.entity';
import { AccountType } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRole } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatus } from '../../../../core/domain/account/value-objects/account-status.vo';
import { InvitationStatus } from '../../../../core/domain/account/value-objects/invitation-status.vo';
import { SocialLinks } from '../../../../core/domain/account/value-objects/social-links.vo';
import { ServiceArea } from '../../../../core/domain/account/value-objects/service-area.vo';
import { PriceRange } from '../../../../core/domain/account/value-objects/price-range.vo';
import { WorkingHours } from '../../../../core/domain/account/value-objects/working-hours.vo';
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
      // Media fields
      avatarUrl: entity.avatarUrl,
      coverImageUrl: entity.coverImageUrl,
      videoIntroUrl: entity.videoIntroUrl,
      // Contact & Social fields
      phone: entity.phone,
      businessEmail: entity.businessEmail,
      website: entity.website,
      socialLinks: entity.socialLinks
        ? SocialLinks.fromJSON(entity.socialLinks)
        : null,
      // Professional/Service fields
      tagline: entity.tagline,
      serviceAreas: entity.serviceAreas
        ? ServiceArea.fromArray(entity.serviceAreas)
        : [],
      languages: entity.languages ?? [],
      workingHours: WorkingHours.fromJSON(entity.workingHours),
      priceRange: PriceRange.fromJSON(entity.priceRange),
      // Trust & Verification fields
      isVerified: entity.isVerified ?? false,
      verifiedAt: entity.verifiedAt,
      badges: entity.badges ?? [],
      rating: entity.rating ? Number(entity.rating) : null,
      totalReviews: entity.totalReviews ?? 0,
      completedBookings: entity.completedBookings ?? 0,
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
    // Media fields
    entity.avatarUrl = domain.avatarUrl;
    entity.coverImageUrl = domain.coverImageUrl;
    entity.videoIntroUrl = domain.videoIntroUrl;
    // Contact & Social fields
    entity.phone = domain.phone;
    entity.businessEmail = domain.businessEmail;
    entity.website = domain.website;
    entity.socialLinks = this.mapSocialLinks(domain.socialLinks);
    // Professional/Service fields
    entity.tagline = domain.tagline;
    entity.serviceAreas = this.mapServiceAreas(domain.serviceAreas);
    entity.languages = domain.languages;
    entity.workingHours = this.mapWorkingHours(domain.workingHours);
    entity.priceRange = this.mapPriceRange(domain.priceRange);
    // Trust & Verification fields
    entity.isVerified = domain.isVerified;
    entity.verifiedAt = domain.verifiedAt;
    entity.badges = domain.badges;
    entity.rating = domain.rating;
    entity.totalReviews = domain.totalReviews;
    entity.completedBookings = domain.completedBookings;
    return entity;
  }

  private mapSocialLinks(
    socialLinks: SocialLinks | null,
  ): ReturnType<SocialLinks['toJSON']> | null {
    return socialLinks?.toJSON() ?? null;
  }

  private mapServiceAreas(
    serviceAreas: ServiceArea[],
  ): ReturnType<ServiceArea['toJSON']>[] {
    return serviceAreas.map((sa) => sa.toJSON());
  }

  private mapWorkingHours(
    workingHours: WorkingHours | null,
  ): ReturnType<WorkingHours['toJSON']> | null {
    return workingHours?.toJSON() ?? null;
  }

  private mapPriceRange(
    priceRange: PriceRange | null,
  ): ReturnType<PriceRange['toJSON']> | null {
    return priceRange?.toJSON() ?? null;
  }
}
