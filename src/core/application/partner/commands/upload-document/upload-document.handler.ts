import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UploadDocumentCommand } from './upload-document.command';
import { PartnerDocument } from '../../../../domain/partner/entities/partner-document.entity';
import {
  PARTNER_DOCUMENT_REPOSITORY,
  IPartnerDocumentRepository,
} from '../../../../domain/partner/repositories/partner-document.repository.interface';
import {
  PARTNER_REPOSITORY,
  IPartnerRepository,
} from '../../../../domain/partner/repositories/partner.repository.interface';
import { PartnerTypeEnum } from '../../../../domain/partner/value-objects/partner-type.vo';

@CommandHandler(UploadDocumentCommand)
export class UploadDocumentHandler implements ICommandHandler<UploadDocumentCommand> {
  constructor(
    @Inject(PARTNER_DOCUMENT_REPOSITORY)
    private readonly documentRepository: IPartnerDocumentRepository,
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<{ id: string }> {
    // Validate partner exists
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    // Verify ownership
    if (partner.userId !== command.userId) {
      throw new ForbiddenException('You do not own this partner profile');
    }

    // Only organization partners need documents
    if (partner.type.value !== PartnerTypeEnum.ORGANIZATION) {
      throw new BadRequestException(
        'Only organization partners need to upload documents',
      );
    }

    // Create document
    const document = PartnerDocument.create({
      partnerId: command.partnerId,
      type: command.type,
      url: command.url,
    });

    await this.documentRepository.save(document);

    return { id: document.id };
  }
}
