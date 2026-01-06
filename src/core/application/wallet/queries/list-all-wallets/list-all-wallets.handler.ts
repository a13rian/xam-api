import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';
import { ListAllWalletsQuery } from './list-all-wallets.query';
import {
  WALLET_REPOSITORY,
  IWalletRepository,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';

export interface WalletListItem {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListAllWalletsResult {
  items: WalletListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
@QueryHandler(ListAllWalletsQuery)
export class ListAllWalletsHandler implements IQueryHandler<
  ListAllWalletsQuery,
  ListAllWalletsResult
> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
  ) {}

  async execute(query: ListAllWalletsQuery): Promise<ListAllWalletsResult> {
    const result = await this.walletRepository.findAll({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      items: result.items.map((wallet) => {
        const props = wallet.toObject();
        return {
          id: props.id,
          userId: props.userId,
          balance: props.balance,
          currency: props.currency,
          createdAt: props.createdAt,
          updatedAt: props.updatedAt,
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
