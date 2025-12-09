import { PartnerBusiness } from '../entities/partner-business.entity';

export const PARTNER_BUSINESS_REPOSITORY = Symbol('IPartnerBusinessRepository');

export interface IPartnerBusinessRepository {
  findByPartnerId(partnerId: string): Promise<PartnerBusiness | null>;
  save(business: PartnerBusiness): Promise<void>;
  delete(partnerId: string): Promise<void>;
}
