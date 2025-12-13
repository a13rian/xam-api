import { DataSource } from 'typeorm';
import { OrganizationOrmEntity } from '../typeorm/entities/organization.orm-entity';
import { OrganizationLocationOrmEntity } from '../typeorm/entities/organization-location.orm-entity';
import { OrganizationStatusEnum } from '../../../core/domain/organization/value-objects/organization-status.vo';
import {
  hcmData,
  hanoiData,
  danangData,
  businessNamePrefixes,
  businessNameSuffixes,
  getRandomElement,
  getRandomOffset,
  getRandomStreetNumber,
  CityData,
} from './data/city-locations';

interface OrgSeedResult {
  orgs: OrganizationOrmEntity[];
  locations: OrganizationLocationOrmEntity[];
}

// Distribution: 40 HCM, 35 Ha Noi, 25 Da Nang
const ORG_DISTRIBUTION = [
  { city: hcmData, count: 40 },
  { city: hanoiData, count: 35 },
  { city: danangData, count: 25 },
];

function generateBusinessName(index: number): string {
  const prefix = getRandomElement(businessNamePrefixes);
  const suffix = getRandomElement(businessNameSuffixes);
  return `${prefix} ${suffix} ${index + 1}`;
}

function generatePhoneNumber(): string {
  const prefixes = [
    '090',
    '091',
    '093',
    '094',
    '096',
    '097',
    '098',
    '086',
    '083',
    '084',
    '085',
  ];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, '0');
  return `${prefix}${number}`;
}

function generateRating(): number {
  // Generate rating between 3.5 and 5.0
  return Math.round((3.5 + Math.random() * 1.5) * 100) / 100;
}

function generateReviewCount(): number {
  // Generate review count between 10 and 500
  return Math.floor(Math.random() * 490) + 10;
}

export async function seedOrganizations(
  dataSource: DataSource,
): Promise<OrgSeedResult> {
  const orgRepository = dataSource.getRepository(OrganizationOrmEntity);
  const locationRepository = dataSource.getRepository(
    OrganizationLocationOrmEntity,
  );

  // Check if organizations already exist
  const existingOrg = await orgRepository.findOne({
    where: { businessName: 'Spa Hương Sen 1' },
  });

  if (existingOrg) {
    console.log('Organizations already seeded');
    const orgs = await orgRepository.find();
    const locations = await locationRepository.find();
    return { orgs, locations };
  }

  const allOrgs: OrganizationOrmEntity[] = [];
  const allLocations: OrganizationLocationOrmEntity[] = [];
  let orgIndex = 0;

  for (const { city, count } of ORG_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      const org = createOrganization(orgIndex, city);
      allOrgs.push(org);
      orgIndex++;
    }
  }

  // Save organizations first
  await orgRepository.save(allOrgs);
  console.log(`Seeded ${allOrgs.length} organizations`);

  // Now create locations for each org
  for (let i = 0; i < allOrgs.length; i++) {
    const org = allOrgs[i];
    const cityData = getCityForOrgIndex(i);
    const location = createLocation(org, cityData);
    allLocations.push(location);
  }

  // Save locations
  await locationRepository.save(allLocations);
  console.log(`Seeded ${allLocations.length} organization locations`);

  return { orgs: allOrgs, locations: allLocations };
}

function getCityForOrgIndex(index: number): CityData {
  if (index < 40) return hcmData;
  if (index < 75) return hanoiData;
  return danangData;
}

function createOrganization(
  index: number,
  city: CityData,
): OrganizationOrmEntity {
  const org = new OrganizationOrmEntity();
  org.businessName = generateBusinessName(index);
  org.status = OrganizationStatusEnum.ACTIVE;
  org.description = `Chào mừng đến với ${org.businessName}. Chúng tôi cung cấp dịch vụ làm đẹp chuyên nghiệp tại ${city.name}.`;
  org.rating = generateRating();
  org.reviewCount = generateReviewCount();
  org.isHomeServiceEnabled = Math.random() > 0.7; // 30% offer home service
  org.homeServiceRadiusKm = org.isHomeServiceEnabled
    ? Math.floor(Math.random() * 10) + 5
    : null;
  org.approvedAt = new Date();
  org.taxId = null;
  org.businessLicense = null;
  org.companySize = getRandomElement(['micro', 'small', 'medium']);
  org.website = null;
  org.socialMedia = {};
  org.establishedDate = null;
  org.rejectionReason = null;
  org.approvedBy = null;
  return org;
}

function createLocation(
  org: OrganizationOrmEntity,
  city: CityData,
): OrganizationLocationOrmEntity {
  const district = getRandomElement(city.districts);
  const street = getRandomElement(district.streets);
  const ward = getRandomElement(district.wards);
  const streetNumber = getRandomStreetNumber();

  const latitude = district.latitude + getRandomOffset();
  const longitude = district.longitude + getRandomOffset();

  const location = new OrganizationLocationOrmEntity();
  location.organizationId = org.id;
  location.name = 'Chi nhánh chính';
  location.street = `${streetNumber} ${street}`;
  location.ward = ward;
  location.district = district.name;
  location.city = city.name;
  location.latitude = latitude;
  location.longitude = longitude;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (location as any).location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  location.phone = generatePhoneNumber();
  location.isPrimary = true;
  location.isActive = true;

  return location;
}
