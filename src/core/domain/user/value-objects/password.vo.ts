import * as bcrypt from 'bcrypt';
import { ValidationException } from '../../../../shared/exceptions/domain.exception';

export class Password {
  private readonly _hash: string;
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 6;

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
  }

  public async verify(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hash);
  }

  get hash(): string {
    return this._hash;
  }
}
