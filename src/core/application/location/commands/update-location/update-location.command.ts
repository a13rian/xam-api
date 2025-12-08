export class UpdateLocationCommand {
  constructor(
    public readonly id: string,
    public readonly partnerId: string,
    public readonly name?: string,
    public readonly street?: string,
    public readonly ward?: string,
    public readonly district?: string,
    public readonly city?: string,
    public readonly latitude?: number,
    public readonly longitude?: number,
    public readonly phone?: string,
  ) {}
}
