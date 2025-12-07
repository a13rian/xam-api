import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IUserRepository } from '../../../../core/domain/user/repositories/user.repository.interface';
import { User } from '../../../../core/domain/user/entities/user.entity';
import { Email } from '../../../../core/domain/user/value-objects/email.vo';
import { PaginationOptions } from '../../../../shared/interfaces/pagination.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @InjectRepository(RoleOrmEntity)
    private readonly roleRepository: Repository<RoleOrmEntity>,
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

  async findByOrganization(
    organizationId: string,
    options?: PaginationOptions,
  ): Promise<User[]> {
    const entities = await this.ormRepository.find({
      where: { organizationId },
      relations: ['roles'],
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.ormRepository.count({ where: { organizationId } });
  }

  async findAll(options?: PaginationOptions): Promise<User[]> {
    const entities = await this.ormRepository.find({
      relations: ['roles'],
      take: options?.limit ?? 50,
      skip: ((options?.page ?? 1) - 1) * (options?.limit ?? 50),
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countAll(): Promise<number> {
    return this.ormRepository.count();
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
    await this.ormRepository.delete(id);
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { email: email.value },
    });
    return count > 0;
  }
}
