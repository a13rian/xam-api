export enum AllowedFileCategory {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  ANY = 'any',
}

export class FileType {
  private static readonly ALLOWED_TYPES: Record<AllowedFileCategory, string[]> =
    {
      [AllowedFileCategory.IMAGE]: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      [AllowedFileCategory.VIDEO]: [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/mpeg',
      ],
      [AllowedFileCategory.DOCUMENT]: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      [AllowedFileCategory.ANY]: [],
    };

  static isAllowed(mimeType: string, category: AllowedFileCategory): boolean {
    if (category === AllowedFileCategory.ANY) {
      return true;
    }
    return this.ALLOWED_TYPES[category].includes(mimeType);
  }

  static getAllowedTypes(category: AllowedFileCategory): string[] {
    return this.ALLOWED_TYPES[category];
  }

  static getCategory(mimeType: string): AllowedFileCategory | null {
    for (const [category, types] of Object.entries(this.ALLOWED_TYPES)) {
      if (types.includes(mimeType)) {
        return category as AllowedFileCategory;
      }
    }
    return null;
  }

  static getExtension(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
      'video/mpeg': '.mpeg',
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        '.xlsx',
    };
    return extensionMap[mimeType] || '';
  }
}
