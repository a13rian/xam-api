import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper } from '../database/database.helper';
import { PartnerStaffOrmEntity } from '../../../src/infrastructure/persistence/typeorm/entities/partner-staff.orm-entity';
import { StaffRoleEnum } from '../../../src/core/domain/partner/value-objects/staff-role.vo';
import { InvitationStatusEnum } from '../../../src/core/domain/partner/value-objects/invitation-status.vo';

export interface CreatePartnerStaffOptions {
  partnerId: string;
  userId?: string;
  email: string;
  role?: StaffRoleEnum;
  invitationStatus?: InvitationStatusEnum;
  isActive?: boolean;
}

export interface CreatedPartnerStaff {
  id: string;
  partnerId: string;
  userId: string | null;
  email: string;
  role: StaffRoleEnum;
  invitationStatus: InvitationStatusEnum;
  invitationToken: string | null;
  isActive: boolean;
}

export class PartnerStaffFactory {
  constructor(private readonly db: DatabaseHelper) {}

  async create(
    options: CreatePartnerStaffOptions,
  ): Promise<CreatedPartnerStaff> {
    const staffRepo = this.db.getRepository(PartnerStaffOrmEntity);

    const invitationToken =
      options.invitationStatus === InvitationStatusEnum.PENDING
        ? uuidv4()
        : null;

    const staff = staffRepo.create({
      id: uuidv4(),
      partnerId: options.partnerId,
      userId: options.userId ?? null,
      email: options.email,
      role: options.role ?? StaffRoleEnum.STAFF,
      invitationStatus:
        options.invitationStatus ?? InvitationStatusEnum.ACCEPTED,
      invitationToken,
      invitedAt: new Date(),
      acceptedAt:
        options.invitationStatus === InvitationStatusEnum.ACCEPTED
          ? new Date()
          : null,
      isActive: options.isActive ?? true,
    });

    await staffRepo.save(staff);

    return {
      id: staff.id,
      partnerId: staff.partnerId,
      userId: staff.userId,
      email: staff.email,
      role: staff.role,
      invitationStatus: staff.invitationStatus,
      invitationToken: staff.invitationToken,
      isActive: staff.isActive,
    };
  }

  async createOwner(
    partnerId: string,
    userId: string,
    email: string,
  ): Promise<CreatedPartnerStaff> {
    return this.create({
      partnerId,
      userId,
      email,
      role: StaffRoleEnum.OWNER,
      invitationStatus: InvitationStatusEnum.ACCEPTED,
      isActive: true,
    });
  }

  async createPendingInvitation(
    partnerId: string,
    email: string,
    role: StaffRoleEnum = StaffRoleEnum.STAFF,
  ): Promise<CreatedPartnerStaff> {
    return this.create({
      partnerId,
      email,
      role,
      invitationStatus: InvitationStatusEnum.PENDING,
      isActive: false,
    });
  }
}
