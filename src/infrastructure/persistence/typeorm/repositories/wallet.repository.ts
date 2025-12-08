import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWalletRepository } from '../../../../core/domain/wallet/repositories/wallet.repository.interface';
import { Wallet } from '../../../../core/domain/wallet/entities/wallet.entity';
import { WalletOrmEntity } from '../entities/wallet.orm-entity';
import { WalletMapper } from '../mappers/wallet.mapper';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(WalletOrmEntity)
    private readonly ormRepository: Repository<WalletOrmEntity>,
    private readonly mapper: WalletMapper,
  ) {}

  async findById(id: string): Promise<Wallet | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(wallet: Wallet): Promise<void> {
    const entity = this.mapper.toPersistence(wallet);
    await this.ormRepository.save(entity);
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId },
    });
    return count > 0;
  }
}
