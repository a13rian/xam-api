import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IWalletRepository,
  WalletSearchParams,
  WalletSearchResult,
} from '../../../../core/domain/wallet/repositories/wallet.repository.interface';
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

  async findAll(params: WalletSearchParams): Promise<WalletSearchResult> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.ormRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user');

    if (params.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    queryBuilder.orderBy('wallet.createdAt', 'DESC').skip(skip).take(limit);

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      items: entities.map((e) => this.mapper.toDomain(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(userId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId },
    });
    return count > 0;
  }
}
