import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { RejectPartnerCommand } from './reject-partner.command';
import {
  IPartnerRepository,
  PARTNER_REPOSITORY,
} from '../../../../domain/partner/repositories/partner.repository.interface';

export interface RejectPartnerResult {
  id: string;
  userId: string;
  status: string;
  rejectionReason: string;
}

@CommandHandler(RejectPartnerCommand)
export class RejectPartnerHandler implements ICommandHandler<RejectPartnerCommand> {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepository: IPartnerRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RejectPartnerCommand): Promise<RejectPartnerResult> {
    const partner = await this.partnerRepository.findById(command.partnerId);
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const partnerWithContext = this.eventPublisher.mergeObjectContext(partner);

    try {
      partnerWithContext.reject(command.rejectedBy, command.reason);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    await this.partnerRepository.save(partnerWithContext);
    partnerWithContext.commit();

    return {
      id: partnerWithContext.id,
      userId: partnerWithContext.userId,
      status: partnerWithContext.statusValue,
      rejectionReason: partnerWithContext.rejectionReason!,
    };
  }
}
