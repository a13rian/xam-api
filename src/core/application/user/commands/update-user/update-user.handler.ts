import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';

export interface UpdateUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
    const user = await this.userRepository.findById(command.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);

    if (
      command.firstName !== undefined ||
      command.lastName !== undefined ||
      command.phone !== undefined ||
      command.dateOfBirth !== undefined ||
      command.gender !== undefined
    ) {
      userWithContext.update({
        firstName: command.firstName,
        lastName: command.lastName,
        phone: command.phone,
        dateOfBirth: command.dateOfBirth,
        gender: command.gender,
      });
    }

    if (command.isActive !== undefined) {
      if (command.isActive) {
        userWithContext.activate();
      } else {
        userWithContext.deactivate();
      }
    }

    if (command.roleIds !== undefined) {
      if (command.roleIds.length > 0) {
        const roles = await this.roleRepository.findByIds(command.roleIds);
        if (roles.length !== command.roleIds.length) {
          throw new BadRequestException('One or more roles do not exist');
        }
      }

      const currentRoleIds = [...userWithContext.roleIds];
      const rolesToRemove = currentRoleIds.filter(
        (id) => !command.roleIds!.includes(id),
      );
      const rolesToAdd = command.roleIds.filter(
        (id) => !currentRoleIds.includes(id),
      );

      for (const roleId of rolesToRemove) {
        userWithContext.removeRole(roleId);
      }
      for (const roleId of rolesToAdd) {
        userWithContext.assignRole(roleId);
      }
    }

    await this.userRepository.save(userWithContext);
    userWithContext.commit();

    return {
      id: userWithContext.id,
      email: userWithContext.email.value,
      firstName: userWithContext.firstName,
      lastName: userWithContext.lastName,
      isActive: userWithContext.isActive,
    };
  }
}
