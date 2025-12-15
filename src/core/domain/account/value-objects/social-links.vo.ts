export interface SocialLinksData {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  zalo?: string;
  youtube?: string;
}

export class SocialLinks {
  private readonly _facebook: string | null;
  private readonly _instagram: string | null;
  private readonly _tiktok: string | null;
  private readonly _zalo: string | null;
  private readonly _youtube: string | null;

  private constructor(data: SocialLinksData) {
    this._facebook = data.facebook ?? null;
    this._instagram = data.instagram ?? null;
    this._tiktok = data.tiktok ?? null;
    this._zalo = data.zalo ?? null;
    this._youtube = data.youtube ?? null;
  }

  public static create(data: SocialLinksData): SocialLinks {
    return new SocialLinks(data);
  }

  public static empty(): SocialLinks {
    return new SocialLinks({});
  }

  public static fromJSON(json: SocialLinksData | null): SocialLinks {
    if (!json) return SocialLinks.empty();
    return new SocialLinks(json);
  }

  get facebook(): string | null {
    return this._facebook;
  }

  get instagram(): string | null {
    return this._instagram;
  }

  get tiktok(): string | null {
    return this._tiktok;
  }

  get zalo(): string | null {
    return this._zalo;
  }

  get youtube(): string | null {
    return this._youtube;
  }

  public isEmpty(): boolean {
    return (
      !this._facebook &&
      !this._instagram &&
      !this._tiktok &&
      !this._zalo &&
      !this._youtube
    );
  }

  public toJSON(): SocialLinksData {
    const result: SocialLinksData = {};
    if (this._facebook) result.facebook = this._facebook;
    if (this._instagram) result.instagram = this._instagram;
    if (this._tiktok) result.tiktok = this._tiktok;
    if (this._zalo) result.zalo = this._zalo;
    if (this._youtube) result.youtube = this._youtube;
    return result;
  }

  public equals(other: SocialLinks): boolean {
    return (
      this._facebook === other._facebook &&
      this._instagram === other._instagram &&
      this._tiktok === other._tiktok &&
      this._zalo === other._zalo &&
      this._youtube === other._youtube
    );
  }
}
