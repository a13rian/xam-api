import { PartnerLocation } from '../entities/partner-location.entity';

export const PARTNER_LOCATION_REPOSITORY = Symbol(
  'PARTNER_LOCATION_REPOSITORY',
);

export interface IPartnerLocationRepository {
  findById(id: string): Promise<PartnerLocation | null>;
  findByPartnerId(partnerId: string): Promise<PartnerLocation[]>;
  findPrimaryByPartnerId(partnerId: string): Promise<PartnerLocation | null>;
  save(location: PartnerLocation): Promise<void>;
  delete(id: string): Promise<void>;
  clearPrimaryForPartner(partnerId: string, excludeId?: string): Promise<void>;
}
