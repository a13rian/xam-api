import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../../../domain/role/repositories/role.repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { Password } from '../../../../domain/user/value-objects/password.vo';

export interface CreateUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const email = Email.create(command.email);
    const password = await Password.create(command.password);

    const existingUser = await this.userRepository.exists(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    let roleIds: string[] = [];
    if (command.roleIds && command.roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(command.roleIds);
      if (roles.length !== command.roleIds.length) {
        throw new BadRequestException('One or more roles do not exist');
      }
      roleIds = command.roleIds;
    }

    const user = this.eventPublisher.mergeObjectContext(
      User.create({
        email,
        password,
        firstName: command.firstName,
        lastName: command.lastName,
        organizationId: command.organizationId ?? null,
        roleIds,
      }),
    );

    await this.userRepository.save(user);
    user.commit();

    return {
      id: user.id,
      email: user.email.value,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
    };
  }
}
