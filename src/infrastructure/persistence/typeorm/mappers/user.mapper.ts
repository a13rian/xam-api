import { Injectable } from '@nestjs/common';
import { User } from '../../../../core/domain/user/entities/user.entity';
import { Email } from '../../../../core/domain/user/value-objects/email.vo';
import { Password } from '../../../../core/domain/user/value-objects/password.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';

@Injectable()
export class UserMapper {
  toDomain(entity: UserOrmEntity): User {
    return User.reconstitute({
      id: entity.id,
      email: Email.create(entity.email),
      password: Password.fromHash(entity.passwordHash),
      firstName: entity.firstName,
      lastName: entity.lastName,
      isActive: entity.isActive,
      emailVerifiedAt: entity.emailVerifiedAt,
      organizationId: entity.organizationId,
      roleIds: entity.roles?.map((r) => r.id) ?? [],
      roleNames: entity.roles?.map((r) => r.name) ?? [],
      failedLoginAttempts: entity.failedLoginAttempts,
      lockedUntil: entity.lockedUntil,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domain.id;
    entity.email = domain.email.value;
    entity.passwordHash = domain.password.hash;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.isActive = domain.isActive;
    entity.emailVerifiedAt = domain.emailVerifiedAt;
    entity.organizationId = domain.organizationId;
    entity.failedLoginAttempts = domain.failedLoginAttempts;
    entity.lockedUntil = domain.lockedUntil;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
