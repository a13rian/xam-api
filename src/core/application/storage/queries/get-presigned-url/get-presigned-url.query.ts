export class GetPresignedUrlQuery {
  constructor(
    public readonly bucket: string,
    public readonly key: string,
    public readonly operation: 'get' | 'put' = 'get',
    public readonly expiresIn: number = 3600,
  ) {}
}
