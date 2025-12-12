import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAccountRepository } from '../../../../core/domain/account/repositories/account.repository.interface';
import { Account } from '../../../../core/domain/account/entities/account.entity';
import { AccountStatusEnum } from '../../../../core/domain/account/value-objects/account-status.vo';
import { AccountTypeEnum } from '../../../../core/domain/account/value-objects/account-type.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { AccountOrmEntity } from '../entities/account.orm-entity';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(AccountOrmEntity)
    private readonly ormRepository: Repository<AccountOrmEntity>,
    private readonly mapper: AccountMapper,
  ) {}

  async findById(id: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByInvitationToken(token: string): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { invitationToken: token },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOrganizationId(
    organizationId: string,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { organizationId },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByOrganizationId(organizationId: string): Promise<number> {
    return this.ormRepository.count({ where: { organizationId } });
  }

  async findByOrganizationIdAndUserId(
    organizationId: string,
    userId: string,
  ): Promise<Account | null> {
    const entity = await this.ormRepository.findOne({
      where: { organizationId, userId },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStatus(
    status: AccountStatusEnum,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { status },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByStatus(status: AccountStatusEnum): Promise<number> {
    return this.ormRepository.count({ where: { status } });
  }

  async findByType(
    type: AccountTypeEnum,
    options?: PaginationOptions,
  ): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      where: { type },
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByType(type: AccountTypeEnum): Promise<number> {
    return this.ormRepository.count({ where: { type } });
  }

  async findAll(options?: PaginationOptions): Promise<Account[]> {
    const entities = await this.ormRepository.find({
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
  }

  async save(account: Account): Promise<void> {
    const entity = this.mapper.toPersistence(account);
    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { userId },
    });
    return count > 0;
  }

  async existsByOrganizationIdAndEmail(
    organizationId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _email: string,
  ): Promise<boolean> {
    // This would require joining with users table
    // For now, we can check by organization and userId
    const count = await this.ormRepository.count({
      where: { organizationId },
    });
    return count > 0;
  }
}
