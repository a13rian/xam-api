import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateRoleCommand } from './create-role.command';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import {
  IPermissionRepository,
  PERMISSION_REPOSITORY,
} from '../../../../domain/role/repositories/permission.repository.interface';
import { Role } from '../../../../domain/role/entities/role.entity';

export interface CreateRoleResult {
  id: string;
  name: string;
  description: string | null;
  organizationId: string | null;
}

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: IPermissionRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateRoleCommand): Promise<CreateRoleResult> {
    const existingRole = await this.roleRepository.exists(
      command.name,
      command.organizationId,
    );
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    if (command.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(
        command.permissionIds,
      );
      if (permissions.length !== command.permissionIds.length) {
        throw new BadRequestException('One or more permissions do not exist');
      }
    }

    const role = this.eventPublisher.mergeObjectContext(
      Role.create({
        name: command.name,
        description: command.description,
        organizationId: command.organizationId ?? null,
        permissionIds: command.permissionIds,
        isSystem: command.isSystem,
      }),
    );

    await this.roleRepository.save(role);
    role.commit();

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      organizationId: role.organizationId,
    };
  }
}
