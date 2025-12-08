import {
  PartnerDocument,
  DocumentStatusEnum,
} from '../entities/partner-document.entity';

export const PARTNER_DOCUMENT_REPOSITORY = Symbol('IPartnerDocumentRepository');

export interface IPartnerDocumentRepository {
  findById(id: string): Promise<PartnerDocument | null>;
  findByPartnerId(partnerId: string): Promise<PartnerDocument[]>;
  findByPartnerIdAndStatus(
    partnerId: string,
    status: DocumentStatusEnum,
  ): Promise<PartnerDocument[]>;
  save(document: PartnerDocument): Promise<void>;
  delete(id: string): Promise<void>;
}
