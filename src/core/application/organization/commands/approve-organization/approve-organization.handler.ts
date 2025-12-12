import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ApproveOrganizationCommand } from './approve-organization.command';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';

@CommandHandler(ApproveOrganizationCommand)
export class ApproveOrganizationHandler implements ICommandHandler<ApproveOrganizationCommand> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ApproveOrganizationCommand): Promise<void> {
    const organization = await this.organizationRepository.findById(
      command.organizationId,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const orgWithContext = this.eventPublisher.mergeObjectContext(organization);
    orgWithContext.approve(command.approvedBy);

    await this.organizationRepository.save(orgWithContext);
    orgWithContext.commit();
  }
}
