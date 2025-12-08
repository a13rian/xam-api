export class ListPartnerDocumentsQuery {
  constructor(
    public readonly partnerId: string,
    public readonly userId: string,
  ) {}
}
