import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateOrganizationCommand } from './create-organization.command';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { Organization } from '../../../../domain/organization/entities/organization.entity';

export interface CreateOrganizationResult {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: CreateOrganizationCommand,
  ): Promise<CreateOrganizationResult> {
    const owner = await this.userRepository.findById(command.ownerId);
    if (!owner) {
      throw new NotFoundException('Owner user not found');
    }

    const slugExists = await this.organizationRepository.existsBySlug(
      command.slug,
    );
    if (slugExists) {
      throw new ConflictException('Organization with this slug already exists');
    }

    const organization = this.eventPublisher.mergeObjectContext(
      Organization.create({
        name: command.name,
        slug: command.slug,
        ownerId: command.ownerId,
        description: command.description,
      }),
    );

    await this.organizationRepository.save(organization);
    organization.commit();

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      ownerId: organization.ownerId,
    };
  }
}
