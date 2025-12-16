export class UpdateNotificationSettingsCommand {
  constructor(
    public readonly userId: string,
    public readonly emailNotifications?: boolean,
    public readonly pushNotifications?: boolean,
    public readonly marketingEmails?: boolean,
    public readonly bookingReminders?: boolean,
  ) {}
}
