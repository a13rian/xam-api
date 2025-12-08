import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWalletTransactionRepository } from '../../../../core/domain/wallet/repositories/wallet-transaction.repository.interface';
import { WalletTransaction } from '../../../../core/domain/wallet/entities/wallet-transaction.entity';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { WalletTransactionOrmEntity } from '../entities/wallet-transaction.orm-entity';
import { WalletTransactionMapper } from '../mappers/wallet-transaction.mapper';

@Injectable()
export class WalletTransactionRepository implements IWalletTransactionRepository {
  constructor(
    @InjectRepository(WalletTransactionOrmEntity)
    private readonly ormRepository: Repository<WalletTransactionOrmEntity>,
    private readonly mapper: WalletTransactionMapper,
  ) {}

  async findById(id: string): Promise<WalletTransaction | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByWalletId(
    walletId: string,
    options?: PaginationOptions,
  ): Promise<WalletTransaction[]> {
    const entities = await this.ormRepository.find({
      where: { walletId },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByWalletId(walletId: string): Promise<number> {
    return this.ormRepository.count({ where: { walletId } });
  }

  async findByReference(
    referenceType: string,
    referenceId: string,
  ): Promise<WalletTransaction[]> {
    const entities = await this.ormRepository.find({
      where: { referenceType, referenceId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(transaction: WalletTransaction): Promise<void> {
    const entity = this.mapper.toPersistence(transaction);
    await this.ormRepository.save(entity);
  }
}
