import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateOrganizationCommand } from './update-organization.command';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';

export interface UpdateOrganizationResult {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationCommand> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: UpdateOrganizationCommand,
  ): Promise<UpdateOrganizationResult> {
    const organization = await this.organizationRepository.findById(command.id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const orgWithContext = this.eventPublisher.mergeObjectContext(organization);

    if (command.name !== undefined || command.description !== undefined) {
      orgWithContext.update({
        name: command.name,
        description: command.description,
      });
    }

    if (command.isActive !== undefined) {
      if (command.isActive) {
        orgWithContext.activate();
      } else {
        orgWithContext.deactivate();
      }
    }

    await this.organizationRepository.save(orgWithContext);
    orgWithContext.commit();

    return {
      id: orgWithContext.id,
      name: orgWithContext.name,
      slug: orgWithContext.slug,
      isActive: orgWithContext.isActive,
    };
  }
}
