import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  VirtualColumn,
} from 'typeorm';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';
import { InvitationStatusEnum } from '../../../../core/domain/account/value-objects/invitation-status.vo';
import { SocialLinksData } from '../../../../core/domain/account/value-objects/social-links.vo';
import { ServiceAreaData } from '../../../../core/domain/account/value-objects/service-area.vo';
import { PriceRangeData } from '../../../../core/domain/account/value-objects/price-range.vo';
import { WorkingHoursData } from '../../../../core/domain/account/value-objects/working-hours.vo';
import { UserOrmEntity } from './user.orm-entity';
import { OrganizationOrmEntity } from './organization.orm-entity';
import { AccountGalleryOrmEntity } from './account-gallery.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('accounts')
@Index(['organizationId', 'userId'], {
  unique: true,
  where: '"organization_id" IS NOT NULL AND "user_id" IS NOT NULL',
})
export class AccountOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'acc';

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  userId: string;

  @OneToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  organizationId: string | null;

  @ManyToOne(() => OrganizationOrmEntity, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationOrmEntity | null;

  @Column({ type: 'enum', enum: AccountTypeEnum })
  @Index()
  type: AccountTypeEnum;

  @Column({
    type: 'enum',
    enum: AccountRoleEnum,
    nullable: true,
  })
  role: AccountRoleEnum | null;

  @Column({ length: 200 })
  displayName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization: string | null;

  @Column({ type: 'text', nullable: true })
  portfolio: string | null;

  @Column({ type: 'text', nullable: true })
  personalBio: string | null;

  @Column({ type: 'enum', enum: AccountStatusEnum })
  @Index()
  status: AccountStatusEnum;

  @Column({
    type: 'enum',
    enum: InvitationStatusEnum,
    nullable: true,
  })
  invitationStatus: InvitationStatusEnum | null;

  @Index({ unique: true, where: '"invitation_token" IS NOT NULL' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  invitationToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approvedBy: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  // Address fields
  @Column({ type: 'text', nullable: true })
  street: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ward: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  // Virtual column combining address fields
  @VirtualColumn({
    query: (alias) =>
      `CONCAT_WS(', ', ${alias}.street, ${alias}.ward, ${alias}.district, ${alias}.city)`,
  })
  address: string;

  // Coordinate fields for distance tracking
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  // PostGIS location for spatial queries
  @Index('IDX_accounts_location', { spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string | null;

  // Media fields
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImageUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  videoIntroUrl: string | null;

  // Contact & Social fields
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessEmail: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string | null;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: SocialLinksData | null;

  // Professional/Service fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  tagline: string | null;

  @Column({ type: 'jsonb', default: '[]' })
  serviceAreas: ServiceAreaData[];

  @Column({ type: 'jsonb', default: '[]' })
  languages: string[];

  @Column({ type: 'jsonb', nullable: true })
  workingHours: WorkingHoursData | null;

  @Column({ type: 'jsonb', nullable: true })
  priceRange: PriceRangeData | null;

  // Trust & Verification fields
  @Column({ default: false })
  @Index()
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'jsonb', default: '[]' })
  badges: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating: number | null;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  completedBookings: number;

  // Gallery relation - using string reference for inverse side
  // to match the string-based ManyToOne on AccountGalleryOrmEntity
  @OneToMany('AccountGalleryOrmEntity', 'account', {
    cascade: true,
  })
  gallery: AccountGalleryOrmEntity[];
}
