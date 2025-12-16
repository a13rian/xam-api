import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetNotificationSettingsQuery } from './get-notification-settings.query';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../../domain/user/repositories/user.repository.interface';

export interface GetNotificationSettingsResult {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
}

@QueryHandler(GetNotificationSettingsQuery)
export class GetNotificationSettingsHandler implements IQueryHandler<GetNotificationSettingsQuery> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetNotificationSettingsQuery,
  ): Promise<GetNotificationSettingsResult> {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const settings = user.notificationSettings;
    return {
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      marketingEmails: settings.marketingEmails,
      bookingReminders: settings.bookingReminders,
    };
  }
}
