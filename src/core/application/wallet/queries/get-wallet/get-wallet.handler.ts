import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetWalletQuery } from './get-wallet.query';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

export interface GetWalletResult {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

@QueryHandler(GetWalletQuery)
export class GetWalletHandler implements IQueryHandler<GetWalletQuery> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: GetWalletQuery): Promise<GetWalletResult> {
    const wallet = await this.walletRepository.findByUserId(query.userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance.amount,
      currency: wallet.balance.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }
}
