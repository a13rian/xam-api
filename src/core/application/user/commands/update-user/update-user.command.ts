import { GenderEnum } from '../../../../domain/user/value-objects/gender.vo';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phone?: string | null,
    public readonly dateOfBirth?: Date | null,
    public readonly gender?: GenderEnum | null,
    public readonly roleIds?: string[],
    public readonly isActive?: boolean,
  ) {}
}
