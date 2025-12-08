import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('service_categories')
export class ServiceCategoryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ServiceCategoryOrmEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: ServiceCategoryOrmEntity;

  @OneToMany(() => ServiceCategoryOrmEntity, (category) => category.parent)
  children?: ServiceCategoryOrmEntity[];
}
