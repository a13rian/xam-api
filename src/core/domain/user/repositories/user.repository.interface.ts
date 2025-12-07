import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByOrganization(
    organizationId: string,
    options?: PaginationOptions,
  ): Promise<User[]>;
  countByOrganization(organizationId: string): Promise<number>;
  findAll(options?: PaginationOptions): Promise<User[]>;
  countAll(): Promise<number>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: Email): Promise<boolean>;
}
