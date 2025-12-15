import { randomUUID } from 'crypto';

export class FileKey {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a unique file key with the format:
   * {prefix}/{ownerId}/{timestamp}-{uuid}-{sanitized-filename}
   */
  static create(prefix: string, ownerId: string, filename: string): FileKey {
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const uuid = randomUUID().split('-')[0];
    return new FileKey(
      `${prefix}/${ownerId}/${timestamp}-${uuid}-${sanitized}`,
    );
  }

  /**
   * Reconstitute a FileKey from a stored value
   */
  static fromString(value: string): FileKey {
    return new FileKey(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}
