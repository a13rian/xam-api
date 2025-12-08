import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetBalanceQuery } from './get-balance.query';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

export interface GetBalanceResult {
  balance: number;
  currency: string;
}

@QueryHandler(GetBalanceQuery)
export class GetBalanceHandler implements IQueryHandler<GetBalanceQuery> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: GetBalanceQuery): Promise<GetBalanceResult> {
    const wallet = await this.walletRepository.findByUserId(query.userId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      balance: wallet.balance.amount,
      currency: wallet.balance.currency,
    };
  }
}
