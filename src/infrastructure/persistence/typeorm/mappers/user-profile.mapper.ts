import { Injectable } from '@nestjs/common';
import { UserProfile } from '../../../../core/domain/user/entities/user-profile.entity';
import { Gender } from '../../../../core/domain/user/value-objects/gender.vo';
import { UserProfileOrmEntity } from '../entities/user-profile.orm-entity';

@Injectable()
export class UserProfileMapper {
  toDomain(entity: UserProfileOrmEntity): UserProfile {
    return UserProfile.reconstitute({
      userId: entity.userId,
      avatar: entity.avatar,
      bio: entity.bio,
      phone: entity.phone,
      address: entity.address,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender ? Gender.fromString(entity.gender) : null,
      preferences: entity.preferences ?? {},
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: UserProfile): UserProfileOrmEntity {
    const entity = new UserProfileOrmEntity();
    entity.userId = domain.userId;
    entity.avatar = domain.avatar;
    entity.bio = domain.bio;
    entity.phone = domain.phone;
    entity.address = domain.address;
    entity.dateOfBirth = domain.dateOfBirth;
    entity.gender = domain.genderValue;
    entity.preferences = domain.preferences;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
