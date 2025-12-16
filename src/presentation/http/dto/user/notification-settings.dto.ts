import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @IsOptional()
  @IsBoolean()
  bookingReminders?: boolean;
}
