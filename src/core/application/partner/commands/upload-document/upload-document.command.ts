import { DocumentTypeEnum } from '../../../../domain/partner/entities/partner-document.entity';

export class UploadDocumentCommand {
  constructor(
    public readonly partnerId: string,
    public readonly userId: string,
    public readonly type: DocumentTypeEnum,
    public readonly url: string,
  ) {}
}
