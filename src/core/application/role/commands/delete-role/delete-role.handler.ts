import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteRoleCommand } from './delete-role.command';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import { RoleDeletedEvent } from '../../../../domain/role/events/role-deleted.event';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const role = await this.roleRepository.findById(command.id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    const roleWithContext = this.eventPublisher.mergeObjectContext(role);

    await this.roleRepository.delete(command.id);

    roleWithContext.apply(
      new RoleDeletedEvent(role.id, role.name, role.organizationId),
    );
    roleWithContext.commit();
  }
}
