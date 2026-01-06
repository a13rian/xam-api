import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ListTransactionsQuery } from './list-transactions.query';
import {
  IWalletRepository,
  WALLET_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet.repository.interface';
import {
  IWalletTransactionRepository,
  WALLET_TRANSACTION_REPOSITORY,
} from '../../../../domain/wallet/repositories/wallet-transaction.repository.interface';
import { TransactionTypeEnum } from '../../../../domain/wallet/value-objects/transaction-type.vo';

export interface TransactionDto {
  id: string;
  type: TransactionTypeEnum;
  amount: number;
  balanceAfter: number;
  currency: string;
  referenceType: string | null;
  referenceId: string | null;
  description: string;
  createdAt: Date;
}

export interface ListTransactionsResult {
  transactions: TransactionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(ListTransactionsQuery)
export class ListTransactionsHandler implements IQueryHandler<ListTransactionsQuery> {
  constructor(
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepository: IWalletRepository,
    @Inject(WALLET_TRANSACTION_REPOSITORY)
    private readonly transactionRepository: IWalletTransactionRepository,
  ) {}

  async execute(query: ListTransactionsQuery): Promise<ListTransactionsResult> {
    const wallet = query.byWalletId
      ? await this.walletRepository.findById(query.id)
      : await this.walletRepository.findByUserId(query.id);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findByWalletId(wallet.id, {
        page: query.page,
        limit: query.limit,
      }),
      this.transactionRepository.countByWalletId(wallet.id),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.typeValue,
        amount: tx.amount.amount,
        balanceAfter: tx.balanceAfter.amount,
        currency: tx.amount.currency,
        referenceType: tx.referenceType,
        referenceId: tx.referenceId,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
