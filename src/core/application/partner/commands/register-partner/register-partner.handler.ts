import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterPartnerCommand } from './register-partner.command';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import {
  IPartnerStaffRepository,
  PARTNER_STAFF_REPOSITORY,
} from '../../../../domain/partner/repositories/partner-staff.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { Partner } from '../../../../domain/partner/entities/partner.entity';
import { PartnerStaff } from '../../../../domain/partner/entities/partner-staff.entity';
import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';

export interface RegisterPartnerResult {
  id: string;
  userId: string;
  type: string;
  status: string;
  businessName: string;
  description: string | null;
}

@CommandHandler(RegisterPartnerCommand)
export class RegisterPartnerHandler implements ICommandHandler<RegisterPartnerCommand> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: RegisterPartnerCommand,
  ): Promise<RegisterPartnerResult> {
    const existingPartner = await this.partnerRepository.exists(command.userId);
    if (existingPartner) {
      throw new ConflictException('User is already registered as a partner');
    }

    // Get user email for staff creation
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const partner = this.eventPublisher.mergeObjectContext(
      Partner.create({
        userId: command.userId,
        type: command.type,
        businessName: command.businessName,
        description: command.description,
      }),
    );

    await this.partnerRepository.save(partner);

    // Auto-create owner staff for organization partners
    if (command.type === PartnerTypeEnum.ORGANIZATION) {
      const ownerStaff = PartnerStaff.createOwner({
        partnerId: partner.id,
        userId: command.userId,
        email: user.email.value,
      });
      await this.staffRepository.save(ownerStaff);
    }

    partner.commit();

    return {
      id: partner.id,
      userId: partner.userId,
      type: partner.typeValue,
      status: partner.statusValue,
      businessName: partner.businessName,
      description: partner.description,
    };
  }
}
