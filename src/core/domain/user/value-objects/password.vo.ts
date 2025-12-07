import * as bcrypt from 'bcrypt';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export class Password {
  private readonly _hash: string;
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 8;

  private constructor(hash: string) {
    this._hash = hash;
  }

  public static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hash = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hash);
  }

  public static fromHash(hash: string): Password {
    return new Password(hash);
  }

  private static validate(password: string): void {
    if (password.length < Password.MIN_LENGTH) {
      throw new ValidationException(
        `Password must be at least ${Password.MIN_LENGTH} characters long`,
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationException(
        'Password must contain at least one uppercase letter',
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationException(
        'Password must contain at least one lowercase letter',
      );
    }

    if (!/\d/.test(password)) {
      throw new ValidationException('Password must contain at least one digit');
    }
  }

  public async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hash);
  }

  get hash(): string {
    return this._hash;
  }
}
