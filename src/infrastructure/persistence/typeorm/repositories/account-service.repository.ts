import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountService } from '../../../../core/domain/account-service/entities/account-service.entity';
import {
  IAccountServiceRepository,
  AccountServiceSearchOptions,
  AccountServiceSearchResult,
} from '../../../../core/domain/account-service/repositories/account-service.repository.interface';
import { AccountServiceOrmEntity } from '../entities/account-service.orm-entity';
import { AccountServiceMapper } from '../mappers/account-service.mapper';

@Injectable()
export class AccountServiceRepository implements IAccountServiceRepository {
  constructor(
    @InjectRepository(AccountServiceOrmEntity)
    private readonly repository: Repository<AccountServiceOrmEntity>,
    private readonly mapper: AccountServiceMapper,
  ) {}

  async findById(id: string): Promise<AccountService | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByAccountId(
    accountId: string,
    activeOnly = true,
  ): Promise<AccountService[]> {
    const where: Record<string, unknown> = { accountId };
    if (activeOnly) {
      where.isActive = true;
    }
    const entities = await this.repository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByCategoryId(categoryId: string): Promise<AccountService[]> {
    const entities = await this.repository.find({
      where: { categoryId, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async search(
    options: AccountServiceSearchOptions,
  ): Promise<AccountServiceSearchResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const query = this.repository.createQueryBuilder('accountService');

    if (options.accountId) {
      query.andWhere('accountService.accountId = :accountId', {
        accountId: options.accountId,
      });
    }

    if (options.categoryId) {
      query.andWhere('accountService.categoryId = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    if (options.isActive !== undefined) {
      query.andWhere('accountService.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    if (options.search) {
      query.andWhere(
        '(accountService.name ILIKE :search OR accountService.description ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    query
      .orderBy('accountService.sortOrder', 'ASC')
      .addOrderBy('accountService.name', 'ASC');

    const [entities, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items: entities.map((e) => this.mapper.toDomain(e)),
      total,
      page,
      limit,
    };
  }

  async save(service: AccountService): Promise<void> {
    const ormEntity = this.mapper.toOrm(service);
    await this.repository.save(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async existsByAccountIdAndName(
    accountId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const query = this.repository
      .createQueryBuilder('accountService')
      .where('accountService.accountId = :accountId', { accountId })
      .andWhere('LOWER(accountService.name) = LOWER(:name)', { name });

    if (excludeId) {
      query.andWhere('accountService.id != :excludeId', { excludeId });
    }

    const count = await query.getCount();
    return count > 0;
  }
}
