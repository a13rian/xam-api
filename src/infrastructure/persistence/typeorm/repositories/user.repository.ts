import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  IUserRepository,
  FindAllOptions,
} from '../../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../../core/domain/user/entities/user.entity';
import { Email } from '../../../../core/domain/user/value-objects/email.vo';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import {
  AccountOrmEntity,
  BookingOrmEntity,
  WalletOrmEntity,
  RefreshTokenOrmEntity,
  EmailVerificationTokenOrmEntity,
  PasswordResetTokenOrmEntity,
} from '../entities';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
    @InjectRepository(AccountOrmEntity)
    private readonly accountRepository: Repository<AccountOrmEntity>,
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepository: Repository<BookingOrmEntity>,
    @InjectRepository(WalletOrmEntity)
    private readonly walletRepository: Repository<WalletOrmEntity>,
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenOrmEntity>,
    @InjectRepository(EmailVerificationTokenOrmEntity)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationTokenOrmEntity>,
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly passwordResetTokenRepository: Repository<PasswordResetTokenOrmEntity>,
    private readonly mapper: UserMapper,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
      relations: ['roles'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { email: email.value },
      relations: ['roles'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(options?: FindAllOptions): Promise<User[]> {
    const sortField = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'DESC';

    const queryBuilder = this.ormRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .take(options?.limit ?? 50)
      .skip(((options?.page ?? 1) - 1) * (options?.limit ?? 50))
      .orderBy(`user.${sortField}`, sortOrder);

    this.applyFilters(queryBuilder, options);

    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.mapper.toDomain(e));
  }

  private applyFilters(
    queryBuilder: ReturnType<typeof this.ormRepository.createQueryBuilder>,
    options?: FindAllOptions,
  ): void {
    if (options?.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR ' +
          'user.firstName ILIKE :search OR ' +
          'user.lastName ILIKE :search OR ' +
          'user.phone ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    if (options?.roleId) {
      queryBuilder.andWhere('roles.id = :roleId', { roleId: options.roleId });
    }

    if (options?.isEmailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', {
        isEmailVerified: options.isEmailVerified,
      });
    }

    if (options?.createdFrom) {
      queryBuilder.andWhere('user.createdAt >= :createdFrom', {
        createdFrom: options.createdFrom,
      });
    }

    if (options?.createdTo) {
      queryBuilder.andWhere('user.createdAt <= :createdTo', {
        createdTo: options.createdTo,
      });
    }

    if (options?.lastLoginFrom) {
      queryBuilder.andWhere('user.lastLoginAt >= :lastLoginFrom', {
        lastLoginFrom: options.lastLoginFrom,
      });
    }

    if (options?.lastLoginTo) {
      queryBuilder.andWhere('user.lastLoginAt <= :lastLoginTo', {
        lastLoginTo: options.lastLoginTo,
      });
    }
  }

  async countAll(
    options?: Omit<FindAllOptions, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
  ): Promise<number> {
    const queryBuilder = this.ormRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'roles');

    this.applyFilters(queryBuilder, options);

    return await queryBuilder.getCount();
  }

  async save(user: User): Promise<void> {
    const entity = this.mapper.toPersistence(user);

    if (user.roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In([...user.roleIds]) },
      });
      entity.roles = roles;
    } else {
      entity.roles = [];
    }

    await this.ormRepository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.manager.transaction(async (manager) => {
      await manager.softDelete(UserOrmEntity, { id });
      await manager.softDelete(AccountOrmEntity, { userId: id });
      await manager.softDelete(BookingOrmEntity, { customerId: id });
      await manager.softDelete(WalletOrmEntity, { userId: id });
      await manager.softDelete(RefreshTokenOrmEntity, { userId: id });
      await manager.softDelete(EmailVerificationTokenOrmEntity, { userId: id });
      await manager.softDelete(PasswordResetTokenOrmEntity, { userId: id });
    });
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { email: email.value },
    });
    return count > 0;
  }
}
