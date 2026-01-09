import { Injectable } from '@nestjs/common';
import { User } from '../../../../core/domain/user/entities/user.entity';
import { Email } from '../../../../core/domain/user/value-objects/email.vo';
import { Password } from '../../../../core/domain/user/value-objects/password.vo';
import { Gender } from '../../../../core/domain/user/value-objects/gender.vo';
import { NotificationSettings } from '../../../../core/domain/user/value-objects/notification-settings.vo';
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
      avatarUrl: entity.avatarUrl,
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender ? Gender.fromString(entity.gender) : null,
      isActive: entity.isActive,
      emailVerifiedAt: entity.emailVerifiedAt,
      roleIds: entity.roles?.map((r) => r.id) ?? [],
      roleNames: entity.roles?.map((r) => r.name) ?? [],
      failedLoginAttempts: entity.failedLoginAttempts,
      lockedUntil: entity.lockedUntil,
      lastLoginAt: entity.lastLoginAt,
      notificationSettings: NotificationSettings.fromJSON(
        entity.notificationSettings,
      ),
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
    entity.avatarUrl = domain.avatarUrl;
    entity.phone = domain.phone;
    entity.dateOfBirth = domain.dateOfBirth;
    entity.gender = domain.genderValue;
    entity.isActive = domain.isActive;
    entity.emailVerifiedAt = domain.emailVerifiedAt;
    entity.failedLoginAttempts = domain.failedLoginAttempts;
    entity.lockedUntil = domain.lockedUntil;
    entity.lastLoginAt = domain.lastLoginAt;
    entity.notificationSettings = domain.notificationSettings.toJSON();
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
