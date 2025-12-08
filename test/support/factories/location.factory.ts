import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { PartnerLocationOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner-location.orm-entity';

export interface CreateLocationOptions {
  partnerId: string;
  name?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface CreatedLocation {
  id: string;
  partnerId: string;
  name: string;
  street: string;
  district: string;
  city: string;
  isPrimary: boolean;
  isActive: boolean;
}

let locationCounter = 0;

export class LocationFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateLocationOptions): Promise<CreatedLocation> {
    locationCounter++;
    const locationRepo = this.db.getRepository(PartnerLocationOrmEntity);

    const location = locationRepo.create({
      id: uuidv4(),
      partnerId: options.partnerId,
      name: options.name ?? `Location ${locationCounter}`,
      street: options.street ?? '123 Test Street',
      ward: options.ward ?? null,
      district: options.district ?? 'District 1',
      city: options.city ?? 'Ho Chi Minh City',
      latitude: options.latitude ?? null,
      longitude: options.longitude ?? null,
      phone: options.phone ?? null,
      isPrimary: options.isPrimary ?? false,
      isActive: options.isActive ?? true,
    });

    await locationRepo.save(location);

    return {
      id: location.id,
      partnerId: location.partnerId,
      name: location.name,
      street: location.street,
      district: location.district,
      city: location.city,
      isPrimary: location.isPrimary,
      isActive: location.isActive,
    };
  }

  async createPrimary(
    options: CreateLocationOptions,
  ): Promise<CreatedLocation> {
    return this.create({ ...options, isPrimary: true });
  }
}
