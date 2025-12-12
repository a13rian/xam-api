import { AccountTypeEnum } from '../value-objects/account-type.vo';

export class AccountCreatedEvent {
  constructor(
    public readonly accountId: string,
    public readonly userId: string,
    public readonly type: AccountTypeEnum,
    public readonly organizationId: string | null,
  ) {}
}
