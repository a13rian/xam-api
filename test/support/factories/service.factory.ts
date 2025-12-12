import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { ServiceOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/service.orm-entity';
import { BookingTypeEnum } from '../../../src/core/domain/service/value-objects/booking-type.vo';

export interface CreateServiceOptions {
  organizationId: string;
  categoryId: string;
  name?: string;
  description?: string;
  priceAmount?: number;
  priceCurrency?: string;
  durationMinutes?: number;
  bookingType?: BookingTypeEnum;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreatedService {
  id: string;
  organizationId: string;
  categoryId: string;
  name: string;
  priceAmount: number;
  priceCurrency: string;
  durationMinutes: number;
  isActive: boolean;
}

let serviceCounter = 0;

export class ServiceFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(options: CreateServiceOptions): Promise<CreatedService> {
    serviceCounter++;
    const serviceRepo = this.db.getRepository(ServiceOrmEntity);

    const service = serviceRepo.create({
      id: uuidv4(),
      organizationId: options.organizationId,
      categoryId: options.categoryId,
      name: options.name ?? `Test Service ${serviceCounter}`,
      description: options.description ?? null,
      priceAmount: options.priceAmount ?? 100000,
      priceCurrency: options.priceCurrency ?? 'VND',
      durationMinutes: options.durationMinutes ?? 60,
      bookingType: options.bookingType ?? BookingTypeEnum.TIME_SLOT,
      isActive: options.isActive ?? true,
      sortOrder: options.sortOrder ?? 0,
    });

    await serviceRepo.save(service);

    return {
      id: service.id,
      organizationId: service.organizationId,
      categoryId: service.categoryId,
      name: service.name,
      priceAmount: Number(service.priceAmount),
      priceCurrency: service.priceCurrency,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
    };
  }
}
