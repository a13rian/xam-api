import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListPartnerDocumentsQuery } from './list-documents.query';
import {
  PARTNER_DOCUMENT_REPOSITORY,
  IPartnerDocumentRepository,
} from '../../../../domain/partner/repositories/partner-document.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';

export interface DocumentResponseDto {
  id: string;
  partnerId: string;
  type: string;
  url: string;
  status: string;
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
}

@QueryHandler(ListPartnerDocumentsQuery)
export class ListPartnerDocumentsHandler implements IQueryHandler<ListPartnerDocumentsQuery> {
  constructor(
    @Inject(PARTNER_DOCUMENT_REPOSITORY)
    private readonly documentRepository: IPartnerDocumentRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(
    query: ListPartnerDocumentsQuery,
  ): Promise<{ items: DocumentResponseDto[] }> {
    const partner = await this.partnerRepository.findById(query.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    if (partner.userId !== query.userId) {
      throw new ForbiddenException('You do not own this partner profile');
    }

    const documents = await this.documentRepository.findByPartnerId(
      query.partnerId,
    );

    return {
      items: documents.map((doc) => ({
        id: doc.id,
        partnerId: doc.partnerId,
        type: doc.type,
        url: doc.url,
        status: doc.status,
        rejectionReason: doc.rejectionReason,
        reviewedAt: doc.reviewedAt,
        createdAt: doc.createdAt,
      })),
    };
  }
}
