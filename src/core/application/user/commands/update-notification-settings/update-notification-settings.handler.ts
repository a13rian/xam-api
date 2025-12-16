import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateNotificationSettingsCommand } from './update-notification-settings.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';

export interface UpdateNotificationSettingsResult {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
}

@CommandHandler(UpdateNotificationSettingsCommand)
export class UpdateNotificationSettingsHandler implements ICommandHandler<UpdateNotificationSettingsCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: UpdateNotificationSettingsCommand,
  ): Promise<UpdateNotificationSettingsResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userWithContext = this.eventPublisher.mergeObjectContext(user);

    userWithContext.updateNotificationSettings({
      emailNotifications: command.emailNotifications,
      pushNotifications: command.pushNotifications,
      marketingEmails: command.marketingEmails,
      bookingReminders: command.bookingReminders,
    });

    await this.userRepository.save(userWithContext);
    userWithContext.commit();

    const settings = userWithContext.notificationSettings;
    return {
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      marketingEmails: settings.marketingEmails,
      bookingReminders: settings.bookingReminders,
    };
  }
}
