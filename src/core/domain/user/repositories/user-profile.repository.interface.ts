import { UserProfile } from '../entities/user-profile.entity';

export const USER_PROFILE_REPOSITORY = Symbol('IUserProfileRepository');

export interface IUserProfileRepository {
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(userId: string): Promise<void>;
}
