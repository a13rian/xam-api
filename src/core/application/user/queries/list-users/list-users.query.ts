import {
  UserSortField,
  SortOrder,
} from '../../../../domain/user/repositories/user.repository.interface';

export class ListUsersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 50,
    public readonly search?: string,
    public readonly isActive?: boolean,
    public readonly roleId?: string,
    public readonly isEmailVerified?: boolean,
    public readonly createdFrom?: Date,
    public readonly createdTo?: Date,
    public readonly lastLoginFrom?: Date,
    public readonly lastLoginTo?: Date,
    public readonly sortBy?: UserSortField,
    public readonly sortOrder?: SortOrder,
  ) {}
}
