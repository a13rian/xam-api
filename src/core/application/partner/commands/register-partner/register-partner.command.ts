import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';

export class RegisterPartnerCommand {
  constructor(
    public readonly userId: string,
    public readonly type: PartnerTypeEnum,
    public readonly businessName: string,
    public readonly description?: string,
  ) {}
}
