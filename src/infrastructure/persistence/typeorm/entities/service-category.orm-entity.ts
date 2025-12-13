import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('service_categories')
export class ServiceCategoryOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'cat';

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ type: 'text', nullable: true })
  iconUrl?: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => ServiceCategoryOrmEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: ServiceCategoryOrmEntity;

  @OneToMany(() => ServiceCategoryOrmEntity, (category) => category.parent)
  children?: ServiceCategoryOrmEntity[];
}
