import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
  IPartnerBusinessRepository,
  PARTNER_BUSINESS_REPOSITORY,
} from '../../../../domain/partner/repositories/partner-business.repository.interface';
import {
  IPartnerIndividualRepository,
  PARTNER_INDIVIDUAL_REPOSITORY,
} from '../../../../domain/partner/repositories/partner-individual.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { Partner } from '../../../../domain/partner/entities/partner.entity';
import { PartnerBusiness } from '../../../../domain/partner/entities/partner-business.entity';
import { PartnerIndividual } from '../../../../domain/partner/entities/partner-individual.entity';
import { PartnerStaff } from '../../../../domain/partner/entities/partner-staff.entity';
import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';

export interface RegisterPartnerResult {
  id: string;
  userId: string;
  type: string;
  status: string;
  description: string | null;
  businessName?: string;
  displayName?: string;
}

@CommandHandler(RegisterPartnerCommand)
export class RegisterPartnerHandler implements ICommandHandler<RegisterPartnerCommand> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
    @Inject(PARTNER_STAFF_REPOSITORY)
    private readonly staffRepository: IPartnerStaffRepository,
    @Inject(PARTNER_BUSINESS_REPOSITORY)
    private readonly businessRepository: IPartnerBusinessRepository,
    @Inject(PARTNER_INDIVIDUAL_REPOSITORY)
    private readonly individualRepository: IPartnerIndividualRepository,
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

    // Validate required fields based on type
    if (command.type === PartnerTypeEnum.BUSINESS && !command.businessName) {
      throw new BadRequestException(
        'businessName is required for business partners',
      );
    }
    if (command.type === PartnerTypeEnum.INDIVIDUAL && !command.displayName) {
      throw new BadRequestException(
        'displayName is required for individual partners',
      );
    }

    const partner = this.eventPublisher.mergeObjectContext(
      Partner.create({
        userId: command.userId,
        type: command.type,
        description: command.description,
      }),
    );

    await this.partnerRepository.save(partner);

    let resultBusinessName: string | undefined;
    let resultDisplayName: string | undefined;

    // Create type-specific child entity
    if (command.type === PartnerTypeEnum.BUSINESS) {
      const business = PartnerBusiness.create({
        partnerId: partner.id,
        businessName: command.businessName!,
        taxId: command.taxId,
        businessLicense: command.businessLicense,
        companySize: command.companySize,
        website: command.website,
        socialMedia: command.socialMedia,
        establishedDate: command.establishedDate,
      });
      await this.businessRepository.save(business);
      resultBusinessName = business.businessName;

      // Auto-create owner staff for business partners
      const ownerStaff = PartnerStaff.createOwner({
        partnerId: partner.id,
        userId: command.userId,
        email: user.email.value,
      });
      await this.staffRepository.save(ownerStaff);
    } else {
      const individual = PartnerIndividual.create({
        partnerId: partner.id,
        displayName: command.displayName!,
        idCardNumber: command.idCardNumber,
        specialization: command.specialization,
        yearsExperience: command.yearsExperience,
        certifications: command.certifications,
        portfolio: command.portfolio,
        personalBio: command.personalBio,
      });
      await this.individualRepository.save(individual);
      resultDisplayName = individual.displayName;
    }

    partner.commit();

    return {
      id: partner.id,
      userId: partner.userId,
      type: partner.typeValue,
      status: partner.statusValue,
      description: partner.description,
      businessName: resultBusinessName,
      displayName: resultDisplayName,
    };
  }
}
