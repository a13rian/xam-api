import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import {
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RegisterAccountCommand } from './register-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import {
  IOrganizationRepository,
  ORGANIZATION_REPOSITORY,
} from '../../../../domain/organization/repositories/organization.repository.interface';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';
import { Account } from '../../../../domain/account/entities/account.entity';
import { Organization } from '../../../../domain/organization/entities/organization.entity';
import { AccountTypeEnum } from '../../../../domain/account/value-objects/account-type.vo';

export interface RegisterAccountResult {
  id: string;
  userId: string;
  type: string;
  displayName: string;
  status: string;
  organizationId?: string;
  businessName?: string;
}

@CommandHandler(RegisterAccountCommand)
export class RegisterAccountHandler implements ICommandHandler<RegisterAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly organizationRepository: IOrganizationRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: RegisterAccountCommand,
  ): Promise<RegisterAccountResult> {
    // Check if user already has an account
    const existingAccount = await this.accountRepository.existsByUserId(
      command.userId,
    );
    if (existingAccount) {
      throw new ConflictException('User already has an account');
    }

    // Get user to verify existence
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate required fields based on type
    if (command.type === AccountTypeEnum.BUSINESS && !command.businessName) {
      throw new BadRequestException(
        'businessName is required for business accounts',
      );
    }

    let account: Account;
    let organization: Organization | null = null;

    if (command.type === AccountTypeEnum.INDIVIDUAL) {
      // Create individual account (no organization)
      account = this.eventPublisher.mergeObjectContext(
        Account.createIndividual({
          userId: command.userId,
          displayName: command.displayName,
          specialization: command.specialization,
          yearsExperience: command.yearsExperience,
          certifications: command.certifications,
          portfolio: command.portfolio,
          personalBio: command.personalBio,
        }),
      );
    } else {
      // Create organization first
      organization = this.eventPublisher.mergeObjectContext(
        Organization.create({
          businessName: command.businessName!,
          description: command.description,
          taxId: command.taxId,
          businessLicense: command.businessLicense,
          companySize: command.companySize,
          website: command.website,
          socialMedia: command.socialMedia,
          establishedDate: command.establishedDate,
        }),
      );

      await this.organizationRepository.save(organization);

      // Create business owner account linked to organization
      account = this.eventPublisher.mergeObjectContext(
        Account.createBusinessOwner({
          userId: command.userId,
          organizationId: organization.id,
          displayName: command.displayName,
        }),
      );
    }

    await this.accountRepository.save(account);

    // Commit domain events
    account.commit();
    if (organization) {
      organization.commit();
    }

    return {
      id: account.id,
      userId: account.userId,
      type: account.typeValue,
      displayName: account.displayName,
      status: account.statusValue,
      organizationId: organization?.id,
      businessName: organization?.businessName,
    };
  }
}
