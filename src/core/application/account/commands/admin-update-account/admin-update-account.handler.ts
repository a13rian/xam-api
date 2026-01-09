import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AdminUpdateAccountCommand } from './admin-update-account.command';
import {
  IAccountRepository,
  ACCOUNT_REPOSITORY,
} from '../../../../domain/account/repositories/account.repository.interface';
import { Account } from '../../../../domain/account/entities/account.entity';

@CommandHandler(AdminUpdateAccountCommand)
export class AdminUpdateAccountHandler implements ICommandHandler<AdminUpdateAccountCommand> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: AdminUpdateAccountCommand): Promise<Account> {
    const account = await this.accountRepository.findById(command.accountId);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const { data } = command;

    // Update profile fields
    if (
      data.displayName !== undefined ||
      data.specialization !== undefined ||
      data.personalBio !== undefined ||
      data.portfolio !== undefined
    ) {
      account.updateProfile({
        displayName: data.displayName,
        specialization: data.specialization,
        personalBio: data.personalBio,
        portfolio: data.portfolio,
      });
    }

    // Update contact info
    if (
      data.phone !== undefined ||
      data.businessEmail !== undefined ||
      data.website !== undefined
    ) {
      account.updateContactInfo({
        phone: data.phone,
        businessEmail: data.businessEmail,
        website: data.website,
      });
    }

    // Update professional info
    if (data.tagline !== undefined) {
      account.updateProfessionalInfo({
        tagline: data.tagline,
      });
    }

    // Update verification status
    if (data.isVerified !== undefined) {
      if (data.isVerified && !account.isVerified) {
        account.verify();
      } else if (!data.isVerified && account.isVerified) {
        account.unverify();
      }
    }

    await this.accountRepository.save(account);
    return account;
  }
}
