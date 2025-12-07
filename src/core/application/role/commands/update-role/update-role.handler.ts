import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateRoleCommand } from './update-role.command';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../../../../domain/role/repositories/permission.repository.interface';

export interface UpdateRoleResult {
  id: string;
  name: string;
  description: string | null;
  permissionIds: string[];
}

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<UpdateRoleResult> {
    const role = await this.roleRepository.findById(command.id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be modified');
    }

    const roleWithContext = this.eventPublisher.mergeObjectContext(role);

    if (command.name !== undefined || command.description !== undefined) {
      roleWithContext.update({
        name: command.name,
        description: command.description,
      });
    }

    if (command.permissionIds !== undefined) {
      if (command.permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findByIds(
          command.permissionIds,
        );
        if (permissions.length !== command.permissionIds.length) {
          throw new BadRequestException('One or more permissions do not exist');
        }
      }

      const currentPermissionIds = [...roleWithContext.permissionIds];
      const permissionsToRemove = currentPermissionIds.filter(
        (id) => !command.permissionIds!.includes(id),
      );
      const permissionsToAdd = command.permissionIds.filter(
        (id) => !currentPermissionIds.includes(id),
      );

      for (const permissionId of permissionsToRemove) {
        roleWithContext.removePermission(permissionId);
      }
      for (const permissionId of permissionsToAdd) {
        roleWithContext.addPermission(permissionId);
      }
    }

    await this.roleRepository.save(roleWithContext);
    roleWithContext.commit();

    return {
      id: roleWithContext.id,
      name: roleWithContext.name,
      description: roleWithContext.description,
      permissionIds: [...roleWithContext.permissionIds],
    };
  }
}
