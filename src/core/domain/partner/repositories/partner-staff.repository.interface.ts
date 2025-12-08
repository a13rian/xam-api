import { PartnerStaff } from '../entities/partner-staff.entity';

export const PARTNER_STAFF_REPOSITORY = Symbol('PARTNER_STAFF_REPOSITORY');

export interface IPartnerStaffRepository {
  findById(id: string): Promise<PartnerStaff | null>;
  findByInvitationToken(token: string): Promise<PartnerStaff | null>;
  findByPartnerIdAndUserId(
    partnerId: string,
    userId: string,
  ): Promise<PartnerStaff | null>;
  findByPartnerIdAndEmail(
    partnerId: string,
    email: string,
  ): Promise<PartnerStaff | null>;
  findByUserId(userId: string): Promise<PartnerStaff[]>;
  findByPartnerId(partnerId: string): Promise<PartnerStaff[]>;
  findActiveByPartnerId(partnerId: string): Promise<PartnerStaff[]>;
  save(staff: PartnerStaff): Promise<void>;
  delete(id: string): Promise<void>;
}
