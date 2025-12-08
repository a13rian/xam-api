import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateServiceCommand } from './create-service.command';
import { Service } from '../../../../domain/service/entities/service.entity';
import {
  SERVICE_REPOSITORY,
  IServiceRepository,
} from '../../../../domain/service/repositories/service.repository.interface';
import {
  SERVICE_CATEGORY_REPOSITORY,
  IServiceCategoryRepository,
} from '../../../../domain/service/repositories/service-category.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';

@CommandHandler(CreateServiceCommand)
export class CreateServiceHandler implements ICommandHandler<CreateServiceCommand> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(command: CreateServiceCommand): Promise<{ id: string }> {
    // Verify partner exists and is active
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }
    if (!partner.status.isActive()) {
      throw new ForbiddenException('Partner is not active');
    }

    // Verify category exists
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for duplicate service name
    const exists = await this.serviceRepository.existsByPartnerIdAndName(
      command.partnerId,
      command.name,
    );
    if (exists) {
      throw new ConflictException(
        'Service with this name already exists for this partner',
      );
    }

    const service = Service.create({
      id: uuidv4(),
      partnerId: command.partnerId,
      categoryId: command.categoryId,
      name: command.name,
      description: command.description,
      price: command.price,
      currency: command.currency,
      durationMinutes: command.durationMinutes,
      bookingType: command.bookingType,
      sortOrder: command.sortOrder,
    });

    await this.serviceRepository.save(service);

    return { id: service.id };
  }
}
