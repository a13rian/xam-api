import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IAccountGalleryRepository } from '../../../../core/domain/account/repositories/account-gallery.repository.interface';
import { AccountGallery } from '../../../../core/domain/account/entities/account-gallery.entity';
import { AccountGalleryOrmEntity } from '../entities/account-gallery.orm-entity';
import { AccountGalleryMapper } from '../mappers/account-gallery.mapper';

@Injectable()
export class AccountGalleryRepository implements IAccountGalleryRepository {
  constructor(
    @InjectRepository(AccountGalleryOrmEntity)
    private readonly ormRepository: Repository<AccountGalleryOrmEntity>,
    private readonly mapper: AccountGalleryMapper,
  ) {}

  async findById(id: string): Promise<AccountGallery | null> {
    const entity = await this.ormRepository.findOne({
      where: { id },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByAccountId(accountId: string): Promise<AccountGallery[]> {
    const entities = await this.ormRepository.find({
      where: { accountId },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return this.mapper.toDomainList(entities);
  }

  async save(gallery: AccountGallery): Promise<void> {
    const entity = this.mapper.toPersistence(gallery);
    await this.ormRepository.save(entity);
  }

  async saveMany(galleries: AccountGallery[]): Promise<void> {
    const entities = galleries.map((g) => this.mapper.toPersistence(g));
    await this.ormRepository.save(entities);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async deleteByAccountId(accountId: string): Promise<void> {
    await this.ormRepository.delete({ accountId });
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.ormRepository.count({ where: { accountId } });
  }

  async updateSortOrders(
    items: { id: string; sortOrder: number }[],
  ): Promise<void> {
    const ids = items.map((item) => item.id);
    const entities = await this.ormRepository.find({
      where: { id: In(ids) },
    });

    for (const entity of entities) {
      const item = items.find((i) => i.id === entity.id);
      if (item) {
        entity.sortOrder = item.sortOrder;
      }
    }

    await this.ormRepository.save(entities);
  }
}
