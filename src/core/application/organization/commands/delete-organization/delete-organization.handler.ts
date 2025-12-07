import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteOrganizationCommand } from './delete-organization.command';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import { OrganizationDeletedEvent } from '../../../../domain/organization/events/organization-deleted.event';

@CommandHandler(DeleteOrganizationCommand)
export class DeleteOrganizationHandler implements ICommandHandler<DeleteOrganizationCommand> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteOrganizationCommand): Promise<void> {
    const organization = await this.organizationRepository.findById(command.id);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const orgWithContext = this.eventPublisher.mergeObjectContext(organization);

    await this.organizationRepository.delete(command.id);

    orgWithContext.apply(
      new OrganizationDeletedEvent(organization.id, organization.slug),
    );
    orgWithContext.commit();
  }
}
