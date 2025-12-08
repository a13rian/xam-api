export class ApproveDocumentCommand {
  constructor(
    public readonly documentId: string,
    public readonly reviewedBy: string,
  ) {}
}

export class RejectDocumentCommand {
  constructor(
    public readonly documentId: string,
    public readonly reviewedBy: string,
    public readonly reason: string,
  ) {}
}
