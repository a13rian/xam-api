import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const USER_REPOSITORY = Symbol('IUserRepository');

export type UserSortField =
  | 'createdAt'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'lastLoginAt';
export type SortOrder = 'ASC' | 'DESC';

export interface FindAllOptions extends PaginationOptions {
  search?: string;
  isActive?: boolean;
  roleId?: string;
  isEmailVerified?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findAll(options?: FindAllOptions): Promise<User[]>;
  countAll(options?: Omit<FindAllOptions, 'page' | 'limit'>): Promise<number>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
}
