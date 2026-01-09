export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('IPasswordHasher');
