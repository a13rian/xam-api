import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApprovePartnerCommand } from './approve-partner.command';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';

export interface ApprovePartnerResult {
  id: string;
  userId: string;
  status: string;
  approvedAt: Date;
  approvedBy: string;
}

@CommandHandler(ApprovePartnerCommand)
export class ApprovePartnerHandler implements ICommandHandler<ApprovePartnerCommand> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ApprovePartnerCommand): Promise<ApprovePartnerResult> {
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const partnerWithContext = this.eventPublisher.mergeObjectContext(partner);

    try {
      partnerWithContext.approve(command.approvedBy);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    await this.partnerRepository.save(partnerWithContext);
    partnerWithContext.commit();

    return {
      id: partnerWithContext.id,
      userId: partnerWithContext.userId,
      status: partnerWithContext.statusValue,
      approvedAt: partnerWithContext.approvedAt!,
      approvedBy: partnerWithContext.approvedBy!,
    };
  }
}
