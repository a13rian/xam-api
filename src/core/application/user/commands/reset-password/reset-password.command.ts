export class AdminResetPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly newPassword: string,
  ) {}
}
