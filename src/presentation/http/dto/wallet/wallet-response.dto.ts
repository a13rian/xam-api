import { TransactionTypeEnum } from '../../../../core/domain/wallet/value-objects/transaction-type.vo';

export class WalletResponseDto {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BalanceResponseDto {
  balance: number;
  currency: string;
}

export class TransactionResponseDto {
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

export class TransactionListResponseDto {
  transactions: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DepositResponseDto {
  transactionId: string;
  walletId: string;
  amount: number;
  balanceAfter: number;
  currency: string;
}

export class WithdrawResponseDto {
  transactionId: string;
  walletId: string;
  amount: number;
  balanceAfter: number;
  currency: string;
}
