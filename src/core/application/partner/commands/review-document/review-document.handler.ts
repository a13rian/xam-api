import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ApproveDocumentCommand,
  RejectDocumentCommand,
} from './review-document.command';
import {
  PARTNER_DOCUMENT_REPOSITORY,
  IPartnerDocumentRepository,
} from '../../../../domain/partner/repositories/partner-document.repository.interface';

@CommandHandler(ApproveDocumentCommand)
export class ApproveDocumentHandler implements ICommandHandler<ApproveDocumentCommand> {
  constructor(
    @Inject(PARTNER_DOCUMENT_REPOSITORY)
    private readonly documentRepository: IPartnerDocumentRepository,
  ) {}

  async execute(command: ApproveDocumentCommand): Promise<void> {
    const document = await this.documentRepository.findById(command.documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.isPending()) {
      throw new BadRequestException('Document has already been reviewed');
    }

    document.approve(command.reviewedBy);
    await this.documentRepository.save(document);
  }
}

@CommandHandler(RejectDocumentCommand)
export class RejectDocumentHandler implements ICommandHandler<RejectDocumentCommand> {
  constructor(
    @Inject(PARTNER_DOCUMENT_REPOSITORY)
    private readonly documentRepository: IPartnerDocumentRepository,
  ) {}

  async execute(command: RejectDocumentCommand): Promise<void> {
    const document = await this.documentRepository.findById(command.documentId);
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.isPending()) {
      throw new BadRequestException('Document has already been reviewed');
    }

    document.reject(command.reviewedBy, command.reason);
    await this.documentRepository.save(document);
  }
}
