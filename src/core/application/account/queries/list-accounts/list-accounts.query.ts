import { AccountStatusEnum } from '../../../../domain/account/value-objects/account-status.vo';
import { AccountTypeEnum } from '../../../../domain/account/value-objects/account-type.vo';

export class ListAccountsQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: AccountStatusEnum,
    public readonly type?: AccountTypeEnum,
    public readonly search?: string,
  ) {}
}
