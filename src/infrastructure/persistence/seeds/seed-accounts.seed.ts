import { DataSource } from 'typeorm';
import { AccountOrmEntity } from '../typeorm/entities/account.orm-entity';
import { AccountGalleryOrmEntity } from '../typeorm/entities/account-gallery.orm-entity';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { OrganizationOrmEntity } from '../typeorm/entities/organization.orm-entity';
import { AccountTypeEnum } from '../../../core/domain/account/value-objects/account-type.vo';
import { AccountRoleEnum } from '../../../core/domain/account/value-objects/account-role.vo';
import { AccountStatusEnum } from '../../../core/domain/account/value-objects/account-status.vo';
import {
  hcmData,
  hanoiData,
  danangData,
  getRandomElement,
  getRandomOffset,
  getRandomStreetNumber,
  CityData,
  taglines,
  badgeTypes,
  vietnamesePhonePrefixes,
  DistrictLocation,
} from './data/city-locations';
import { SocialLinksData } from '../../../core/domain/account/value-objects/social-links.vo';
import { ServiceAreaData } from '../../../core/domain/account/value-objects/service-area.vo';
import { PriceRangeData } from '../../../core/domain/account/value-objects/price-range.vo';
import { WorkingHoursData } from '../../../core/domain/account/value-objects/working-hours.vo';

// Distribution constants
const PERSONAL_ACCOUNTS = 700;
const STAFF_ACCOUNTS = 300; // 100 owners + 200 staff (2 per org)

// ===== Helper Functions for Profile Fields =====

function generatePhone(): string {
  const prefix = getRandomElement(vietnamesePhonePrefixes);
  const suffix = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
  return `${prefix}${suffix}`;
}

function generateBusinessEmail(displayName: string, index: number): string {
  const normalized = displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '.');
  return `${normalized}.${index}@business.example.com`;
}

function generateSocialLinks(hasAllLinks: boolean): SocialLinksData | null {
  if (Math.random() < 0.3) return null; // 30% no social links

  const links: SocialLinksData = {};

  if (hasAllLinks || Math.random() > 0.3) {
    links.facebook = `https://facebook.com/profile${Math.floor(Math.random() * 100000)}`;
  }
  if (hasAllLinks || Math.random() > 0.5) {
    links.instagram = `https://instagram.com/user${Math.floor(Math.random() * 100000)}`;
  }
  if (Math.random() > 0.6) {
    links.zalo = generatePhone();
  }
  if (Math.random() > 0.8) {
    links.tiktok = `https://tiktok.com/@user${Math.floor(Math.random() * 100000)}`;
  }

  return Object.keys(links).length > 0 ? links : null;
}

function generateWorkingHours(): WorkingHoursData {
  const standardDay = { open: '09:00', close: '18:00', isOpen: true };
  const saturdayHours = { open: '09:00', close: '17:00', isOpen: true };
  const sundayClosed = { open: '', close: '', isOpen: false };

  return {
    monday: standardDay,
    tuesday: standardDay,
    wednesday: standardDay,
    thursday: standardDay,
    friday: standardDay,
    saturday: Math.random() > 0.3 ? saturdayHours : sundayClosed,
    sunday:
      Math.random() > 0.7
        ? { open: '10:00', close: '16:00', isOpen: true }
        : sundayClosed,
  };
}

function generatePriceRange(): PriceRangeData {
  const minOptions = [100000, 150000, 200000, 250000, 300000];
  const min = getRandomElement(minOptions);
  const maxMultiplier = Math.floor(Math.random() * 5) + 3; // 3x to 7x
  const max = min * maxMultiplier;

  return { min, max, currency: 'VND' };
}

function generateServiceAreas(
  district: DistrictLocation,
  city: CityData,
): ServiceAreaData[] {
  const areas: ServiceAreaData[] = [
    { district: district.name, city: city.name },
  ];

  // 50% chance to add neighboring districts
  if (Math.random() > 0.5 && city.districts.length > 1) {
    const otherDistrict = city.districts.find((d) => d.name !== district.name);
    if (otherDistrict) {
      areas.push({ district: otherDistrict.name, city: city.name });
    }
  }

  return areas;
}

function generateRating(): number {
  // Generate ratings between 3.5 and 5.0
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

function generateBadges(isVerified: boolean): string[] {
  if (!isVerified) return [];

  const numBadges = Math.floor(Math.random() * 3) + 1; // 1-3 badges
  const shuffled = [...badgeTypes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numBadges);
}

function generateAvatarUrl(index: number): string {
  return `https://picsum.photos/seed/avatar${index}/200/200`;
}

function generateCoverImageUrl(index: number): string | null {
  if (Math.random() < 0.3) return null; // 30% no cover
  return `https://picsum.photos/seed/cover${index}/800/300`;
}

// ===== Professional Profile Data =====

// Staff specializations (professional titles)
const staffSpecializations = [
  'Chuyên viên Makeup cao cấp',
  'Chuyên gia tạo mẫu tóc',
  'Nail Artist chuyên nghiệp',
  'Chuyên viên Spa & Wellness',
  'Senior Barber',
  'Chuyên gia chăm sóc da',
  'Massage Therapist cao cấp',
  'Chuyên viên phun xăm thẩm mỹ',
  'Senior Hair Colorist',
  'Bridal Makeup Artist',
];

// Personal/Freelance specializations
const personalSpecializations = [
  'Freelance Makeup Artist',
  'Independent Hair Stylist',
  'Nail Artist tự do',
  'Mobile Spa Therapist',
  'Freelance Barber',
  'Chuyên viên skincare tự do',
  'Mobile Massage Therapist',
  'Freelance Beauty Artist',
  'Independent Lash Artist',
  'Freelance Brow Artist',
];

// Vietnamese bios for staff accounts
const staffBios = [
  'Với hơn {years} năm kinh nghiệm trong ngành làm đẹp, tôi cam kết mang đến dịch vụ chất lượng cao nhất cho khách hàng.',
  'Được đào tạo bài bản tại các học viện hàng đầu, tôi luôn cập nhật xu hướng mới nhất để phục vụ khách hàng.',
  'Đam mê với nghề và sự hài lòng của khách hàng là động lực để tôi không ngừng phát triển bản thân.',
  'Chuyên môn cao trong lĩnh vực làm đẹp, tôi đã phục vụ hàng ngàn khách hàng với sự hài lòng tuyệt đối.',
  'Từng làm việc tại nhiều salon danh tiếng, tôi mang đến kinh nghiệm và kỹ năng chuyên nghiệp cho mọi khách hàng.',
  'Tận tâm với từng chi tiết, tôi luôn lắng nghe và tư vấn để mang đến kết quả tốt nhất cho khách hàng.',
  'Với triết lý "Khách hàng là trung tâm", tôi cam kết dịch vụ chất lượng và trải nghiệm tuyệt vời.',
  'Được nhiều khách hàng tin tưởng và giới thiệu, tôi tự hào về uy tín đã xây dựng trong suốt {years} năm.',
];

// Vietnamese bios for personal accounts
const personalBios = [
  'Yêu thích làm đẹp và luôn muốn thử những xu hướng mới. Đang tìm kiếm stylist tâm đầu ý hợp!',
  'Người thích chăm sóc bản thân và trải nghiệm các dịch vụ spa thư giãn.',
  'Freelancer trong ngành làm đẹp, sẵn sàng phục vụ tại nhà khách hàng.',
  'Đam mê nail art và luôn tìm kiếm những mẫu thiết kế độc đáo.',
  'Quan tâm đến skincare và các phương pháp chăm sóc da tự nhiên.',
  'Thích thử nghiệm kiểu tóc mới và luôn cập nhật trend.',
  'Tự học makeup và muốn phát triển thêm kỹ năng trong lĩnh vực này.',
  'Người yêu thích vẻ đẹp tự nhiên và các sản phẩm organic.',
  'Thường xuyên đến spa và salon, đánh giá cao dịch vụ chất lượng.',
  'Đang build portfolio cá nhân trong ngành làm đẹp.',
];

function generateSpecialization(isStaff: boolean): string {
  return isStaff
    ? getRandomElement(staffSpecializations)
    : getRandomElement(personalSpecializations);
}

function generatePortfolio(index: number, isStaff: boolean): string | null {
  const chance = isStaff ? 0.8 : 0.5;
  if (Math.random() > chance) return null;

  return `https://portfolio.example.com/artist-${index}`;
}

function generatePersonalBio(isStaff: boolean): string {
  if (isStaff) {
    const bio = getRandomElement(staffBios);
    const randomYears = Math.floor(Math.random() * 13) + 3; // 3-15 years for bio text only
    return bio.replace('{years}', String(randomYears));
  }
  return getRandomElement(personalBios);
}

// Gallery captions for variety
const galleryCaptions = [
  'Không gian làm việc',
  'Dịch vụ chuyên nghiệp',
  'Khách hàng hài lòng',
  'Thiết bị hiện đại',
  'Sản phẩm mẫu',
  'Đội ngũ nhân viên',
  'Showroom',
  'Trước và sau',
  null, // Some without captions
  null,
];

function generateGalleryItems(
  accountId: string,
  accountIndex: number,
): AccountGalleryOrmEntity[] {
  const galleries: AccountGalleryOrmEntity[] = [];

  for (let i = 0; i < 10; i++) {
    const gallery = new AccountGalleryOrmEntity();
    gallery.accountId = accountId;
    gallery.imageUrl = `https://picsum.photos/seed/gallery${accountIndex}_${i}/600/400`;
    gallery.storageKey = null;
    gallery.caption = getRandomElement(galleryCaptions);
    gallery.sortOrder = i;
    galleries.push(gallery);
  }

  return galleries;
}

function getCityByIndex(index: number, total: number): CityData {
  // 40% HCM, 35% Ha Noi, 25% Da Nang
  const hcmThreshold = Math.floor(total * 0.4);
  const hanoiThreshold = Math.floor(total * 0.75);

  if (index < hcmThreshold) return hcmData;
  if (index < hanoiThreshold) return hanoiData;
  return danangData;
}

function generateDisplayName(user: UserOrmEntity): string {
  return `${user.lastName} ${user.firstName}`;
}

export async function seedAccountsWithLocations(
  dataSource: DataSource,
  users: UserOrmEntity[],
  organizations: OrganizationOrmEntity[],
): Promise<AccountOrmEntity[]> {
  const accountRepository = dataSource.getRepository(AccountOrmEntity);
  const galleryRepository = dataSource.getRepository(AccountGalleryOrmEntity);

  // Check if bulk accounts already exist
  const existingBulkAccount = await accountRepository
    .createQueryBuilder('account')
    .innerJoin('account.user', 'user')
    .where('user.email LIKE :pattern', { pattern: 'bulk_user_%@example.com' })
    .getOne();

  if (existingBulkAccount) {
    console.log('Accounts with locations already seeded');
    return accountRepository.find();
  }

  // We need 1000 users for accounts
  // users array should contain: 3 system users + 10 normal users + 1000 bulk users
  const bulkUsers = users.filter((u) => u.email.startsWith('bulk_user_'));

  if (bulkUsers.length < 1000) {
    console.log(
      `Warning: Only ${bulkUsers.length} bulk users available, need 1000`,
    );
  }

  const allAccounts: AccountOrmEntity[] = [];

  // Create 300 staff accounts (linked to organizations)
  // 100 owners (1 per org) + 200 staff (2 per org)
  console.log('Creating staff accounts...');
  let userIndex = 0;

  for (
    let orgIndex = 0;
    orgIndex < organizations.length && userIndex < STAFF_ACCOUNTS;
    orgIndex++
  ) {
    const org = organizations[orgIndex];
    const city = getCityForOrgIndex(orgIndex);

    // Create owner account
    if (userIndex < bulkUsers.length) {
      const ownerAccount = createStaffAccount(
        bulkUsers[userIndex],
        org,
        AccountRoleEnum.OWNER,
        city,
      );
      allAccounts.push(ownerAccount);
      userIndex++;
    }

    // Create 2 staff accounts per org
    for (
      let staffNum = 0;
      staffNum < 2 &&
      userIndex < STAFF_ACCOUNTS &&
      userIndex < bulkUsers.length;
      staffNum++
    ) {
      const staffAccount = createStaffAccount(
        bulkUsers[userIndex],
        org,
        AccountRoleEnum.MEMBER,
        city,
      );
      allAccounts.push(staffAccount);
      userIndex++;
    }
  }

  console.log(`Created ${allAccounts.length} staff accounts`);

  // Create 700 personal accounts (no organization)
  console.log('Creating personal accounts...');
  const personalStartIndex = userIndex;
  const personalEndIndex = Math.min(
    personalStartIndex + PERSONAL_ACCOUNTS,
    bulkUsers.length,
  );

  for (let i = personalStartIndex; i < personalEndIndex; i++) {
    const city = getCityByIndex(i - personalStartIndex, PERSONAL_ACCOUNTS);
    const personalAccount = createPersonalAccount(bulkUsers[i], city);
    allAccounts.push(personalAccount);
  }

  console.log(
    `Created ${allAccounts.length - userIndex + personalStartIndex} personal accounts`,
  );

  // Batch save accounts
  const BATCH_SIZE = 100;
  let seededCount = 0;
  const allGalleries: AccountGalleryOrmEntity[] = [];

  for (let i = 0; i < allAccounts.length; i += BATCH_SIZE) {
    const batch = allAccounts.slice(i, i + BATCH_SIZE);
    const savedAccounts = await accountRepository.save(batch);

    // Generate galleries for saved accounts
    savedAccounts.forEach((account, batchIndex) => {
      const globalIndex = i + batchIndex;
      const galleries = generateGalleryItems(account.id, globalIndex);
      allGalleries.push(...galleries);
    });

    seededCount += batch.length;
    console.log(`Seeded ${seededCount}/${allAccounts.length} accounts...`);
  }

  // Batch save galleries
  if (allGalleries.length > 0) {
    console.log(`Seeding ${allGalleries.length} gallery images...`);
    let gallerySeededCount = 0;
    for (let i = 0; i < allGalleries.length; i += BATCH_SIZE) {
      const batch = allGalleries.slice(i, i + BATCH_SIZE);
      await galleryRepository.save(batch);
      gallerySeededCount += batch.length;
      console.log(
        `Seeded ${gallerySeededCount}/${allGalleries.length} gallery images...`,
      );
    }
  }

  console.log(
    `Seeded ${allAccounts.length} accounts with ${allGalleries.length} gallery images`,
  );

  return allAccounts;
}

function getCityForOrgIndex(index: number): CityData {
  // Match org distribution: 40 HCM, 35 Ha Noi, 25 Da Nang
  if (index < 40) return hcmData;
  if (index < 75) return hanoiData;
  return danangData;
}

let staffAccountIndex = 0;

function createStaffAccount(
  user: UserOrmEntity,
  org: OrganizationOrmEntity,
  role: AccountRoleEnum,
  city: CityData,
): AccountOrmEntity {
  staffAccountIndex++;
  const district = getRandomElement(city.districts);
  const street = getRandomElement(district.streets);
  const ward = getRandomElement(district.wards);
  const streetNumber = getRandomStreetNumber();

  const latitude = district.latitude + getRandomOffset();
  const longitude = district.longitude + getRandomOffset();

  const account = new AccountOrmEntity();
  const displayName = generateDisplayName(user);

  account.userId = user.id;
  account.organizationId = org.id;
  account.type = AccountTypeEnum.BUSINESS;
  account.role = role;
  account.displayName = displayName;
  account.status = AccountStatusEnum.ACTIVE;
  account.isActive = true;
  account.approvedAt = new Date();

  // Location fields
  account.street = `${streetNumber} ${street}`;
  account.ward = ward;
  account.district = district.name;
  account.city = city.name;
  account.latitude = latitude;
  account.longitude = longitude;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (account as any).location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // ===== Professional Profile Fields =====
  account.specialization = generateSpecialization(true);
  account.portfolio = generatePortfolio(staffAccountIndex, true);
  account.personalBio = generatePersonalBio(true);

  // Invitation fields (not used for seeded accounts)
  account.invitationStatus = null;
  account.invitationToken = null;
  account.invitedAt = null;
  account.acceptedAt = null;
  account.approvedBy = null;
  account.rejectionReason = null;

  // ===== Media Fields =====
  account.avatarUrl = generateAvatarUrl(staffAccountIndex);
  account.coverImageUrl = generateCoverImageUrl(staffAccountIndex);
  account.videoIntroUrl = null;

  // Contact & Social fields
  account.phone = generatePhone();
  account.businessEmail = generateBusinessEmail(displayName, staffAccountIndex);
  account.website =
    Math.random() > 0.7 ? `https://www.example-${staffAccountIndex}.com` : null;
  account.socialLinks = generateSocialLinks(role === AccountRoleEnum.OWNER);

  // Professional/Service fields
  account.tagline = getRandomElement(taglines);
  account.serviceAreas = generateServiceAreas(district, city);
  account.languages = Math.random() > 0.6 ? ['vi', 'en'] : ['vi'];
  account.workingHours = generateWorkingHours();
  account.priceRange = generatePriceRange();

  // Trust & Verification fields
  // Owners: 50% verified, Members: 20% verified
  const verificationChance = role === AccountRoleEnum.OWNER ? 0.5 : 0.2;
  account.isVerified = Math.random() < verificationChance;
  account.verifiedAt = account.isVerified
    ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000) // Random date within last 180 days
    : null;
  account.badges = generateBadges(account.isVerified);
  account.rating = generateRating();
  account.totalReviews = Math.floor(Math.random() * 500);
  account.completedBookings = Math.floor(Math.random() * 1000);

  return account;
}

let personalAccountIndex = 0;

function createPersonalAccount(
  user: UserOrmEntity,
  city: CityData,
): AccountOrmEntity {
  personalAccountIndex++;
  const district = getRandomElement(city.districts);
  const street = getRandomElement(district.streets);
  const ward = getRandomElement(district.wards);
  const streetNumber = getRandomStreetNumber();

  const latitude = district.latitude + getRandomOffset();
  const longitude = district.longitude + getRandomOffset();

  const account = new AccountOrmEntity();
  account.userId = user.id;
  account.organizationId = null;
  account.type = AccountTypeEnum.INDIVIDUAL;
  account.role = null;
  account.displayName = generateDisplayName(user);
  account.status = AccountStatusEnum.ACTIVE;
  account.isActive = true;
  account.approvedAt = new Date();

  // Location fields
  account.street = `${streetNumber} ${street}`;
  account.ward = ward;
  account.district = district.name;
  account.city = city.name;
  account.latitude = latitude;
  account.longitude = longitude;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (account as any).location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };

  // ===== Professional Profile Fields =====
  account.specialization = generateSpecialization(false);
  account.portfolio = generatePortfolio(1000 + personalAccountIndex, false);
  account.personalBio = generatePersonalBio(false);

  // Invitation fields (not used for seeded accounts)
  account.invitationStatus = null;
  account.invitationToken = null;
  account.invitedAt = null;
  account.acceptedAt = null;
  account.approvedBy = null;
  account.rejectionReason = null;

  // ===== Media Fields =====
  account.avatarUrl = generateAvatarUrl(1000 + personalAccountIndex); // Offset to avoid collision
  account.coverImageUrl = generateCoverImageUrl(1000 + personalAccountIndex);
  account.videoIntroUrl = null;

  // ===== Contact & Social Fields =====
  account.phone = generatePhone();
  account.businessEmail = generateBusinessEmail(
    account.displayName,
    1000 + personalAccountIndex,
  );
  account.website =
    Math.random() > 0.8
      ? `https://www.portfolio-${1000 + personalAccountIndex}.com`
      : null;
  account.socialLinks = generateSocialLinks(false);

  // ===== Professional/Service Fields =====
  account.tagline = getRandomElement(taglines);
  account.serviceAreas = generateServiceAreas(district, city);
  account.languages = Math.random() > 0.7 ? ['vi', 'en'] : ['vi'];
  account.workingHours = generateWorkingHours();
  account.priceRange = generatePriceRange();

  // ===== Trust & Verification Fields =====
  // 10% verified for personal accounts
  account.isVerified = Math.random() < 0.1;
  account.verifiedAt = account.isVerified
    ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
    : null;
  account.badges = generateBadges(account.isVerified);
  account.rating = generateRating();
  account.totalReviews = Math.floor(Math.random() * 200);
  account.completedBookings = Math.floor(Math.random() * 300);

  return account;
}
