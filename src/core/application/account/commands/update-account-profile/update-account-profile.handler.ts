import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateAccountProfileCommand } from './update-account-profile.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import { SocialLinks } from '../../../../domain/account/value-objects/social-links.vo';
import { ServiceArea } from '../../../../domain/account/value-objects/service-area.vo';
import { PriceRange } from '../../../../domain/account/value-objects/price-range.vo';
import { WorkingHours } from '../../../../domain/account/value-objects/working-hours.vo';
import { Account } from '../../../../domain/account/entities/account.entity';

@CommandHandler(UpdateAccountProfileCommand)
export class UpdateAccountProfileHandler implements ICommandHandler<UpdateAccountProfileCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: UpdateAccountProfileCommand): Promise<Account> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const { data } = command;

    // Update basic profile
    if (
      data.displayName !== undefined ||
      data.specialization !== undefined ||
      data.yearsExperience !== undefined ||
      data.certifications !== undefined ||
      data.portfolio !== undefined ||
      data.personalBio !== undefined
    ) {
      account.updateProfile({
        displayName: data.displayName,
        specialization: data.specialization,
        yearsExperience: data.yearsExperience,
        certifications: data.certifications,
        portfolio: data.portfolio,
        personalBio: data.personalBio,
      });
    }

    // Update media
    if (
      data.avatarUrl !== undefined ||
      data.coverImageUrl !== undefined ||
      data.videoIntroUrl !== undefined
    ) {
      account.updateMedia({
        avatarUrl: data.avatarUrl,
        coverImageUrl: data.coverImageUrl,
        videoIntroUrl: data.videoIntroUrl,
      });
    }

    // Update contact info
    if (
      data.phone !== undefined ||
      data.businessEmail !== undefined ||
      data.website !== undefined ||
      data.socialLinks !== undefined
    ) {
      account.updateContactInfo({
        phone: data.phone,
        businessEmail: data.businessEmail,
        website: data.website,
        socialLinks: data.socialLinks
          ? SocialLinks.fromJSON(data.socialLinks)
          : null,
      });
    }

    // Update professional info
    if (
      data.tagline !== undefined ||
      data.serviceAreas !== undefined ||
      data.languages !== undefined ||
      data.workingHours !== undefined ||
      data.priceRange !== undefined
    ) {
      account.updateProfessionalInfo({
        tagline: data.tagline,
        serviceAreas: data.serviceAreas
          ? ServiceArea.fromArray(data.serviceAreas)
          : undefined,
        languages: data.languages,
        workingHours: data.workingHours
          ? WorkingHours.fromJSON(data.workingHours)
          : null,
        priceRange: data.priceRange
          ? PriceRange.fromJSON(data.priceRange)
          : null,
      });
    }

    await this.accountRepository.save(account);
    return account;
  }
}
