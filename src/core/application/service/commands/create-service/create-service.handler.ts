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
  ORGANIZATION_REPOSITORY,
  IOrganizationRepository,
} from '../../../../domain/organization/repositories/organization.repository.interface';

@CommandHandler(CreateServiceCommand)
export class CreateServiceHandler implements ICommandHandler<CreateServiceCommand> {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: IServiceRepository,
    @Inject(SERVICE_CATEGORY_REPOSITORY)
    private readonly categoryRepository: IServiceCategoryRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: CreateServiceCommand): Promise<{ id: string }> {
    // Verify organization exists and is active
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!organization.status.isActive()) {
      throw new ForbiddenException('Organization is not active');
    }

    // Verify category exists
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check for duplicate service name
    const exists = await this.serviceRepository.existsByOrganizationIdAndName(
      command.organizationId,
      command.name,
    );
    if (exists) {
      throw new ConflictException(
        'Service with this name already exists for this organization',
      );
    }

    const service = Service.create({
      id: uuidv4(),
      organizationId: command.organizationId,
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
