export interface NotificationSettingsData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
}

export class NotificationSettings {
  private readonly _emailNotifications: boolean;
  private readonly _pushNotifications: boolean;
  private readonly _marketingEmails: boolean;
  private readonly _bookingReminders: boolean;

  private constructor(data: NotificationSettingsData) {
    this._emailNotifications = data.emailNotifications;
    this._pushNotifications = data.pushNotifications;
    this._marketingEmails = data.marketingEmails;
    this._bookingReminders = data.bookingReminders;
  }

  public static create(
    data?: Partial<NotificationSettingsData>,
  ): NotificationSettings {
    return new NotificationSettings({
      emailNotifications: data?.emailNotifications ?? true,
      pushNotifications: data?.pushNotifications ?? false,
      marketingEmails: data?.marketingEmails ?? false,
      bookingReminders: data?.bookingReminders ?? true,
    });
  }

  public static fromJSON(json: unknown): NotificationSettings {
    if (!json || typeof json !== 'object') {
      return NotificationSettings.create();
    }

    const data = json as Partial<NotificationSettingsData>;
    return new NotificationSettings({
      emailNotifications:
        typeof data.emailNotifications === 'boolean'
          ? data.emailNotifications
          : true,
      pushNotifications:
        typeof data.pushNotifications === 'boolean'
          ? data.pushNotifications
          : false,
      marketingEmails:
        typeof data.marketingEmails === 'boolean'
          ? data.marketingEmails
          : false,
      bookingReminders:
        typeof data.bookingReminders === 'boolean'
          ? data.bookingReminders
          : true,
    });
  }

  public update(
    updates: Partial<NotificationSettingsData>,
  ): NotificationSettings {
    return new NotificationSettings({
      emailNotifications:
        updates.emailNotifications ?? this._emailNotifications,
      pushNotifications: updates.pushNotifications ?? this._pushNotifications,
      marketingEmails: updates.marketingEmails ?? this._marketingEmails,
      bookingReminders: updates.bookingReminders ?? this._bookingReminders,
    });
  }

  public toJSON(): NotificationSettingsData {
    return {
      emailNotifications: this._emailNotifications,
      pushNotifications: this._pushNotifications,
      marketingEmails: this._marketingEmails,
      bookingReminders: this._bookingReminders,
    };
  }

  get emailNotifications(): boolean {
    return this._emailNotifications;
  }

  get pushNotifications(): boolean {
    return this._pushNotifications;
  }

  get marketingEmails(): boolean {
    return this._marketingEmails;
  }

  get bookingReminders(): boolean {
    return this._bookingReminders;
  }

  equals(other: NotificationSettings): boolean {
    return (
      this._emailNotifications === other._emailNotifications &&
      this._pushNotifications === other._pushNotifications &&
      this._marketingEmails === other._marketingEmails &&
      this._bookingReminders === other._bookingReminders
    );
  }
}
