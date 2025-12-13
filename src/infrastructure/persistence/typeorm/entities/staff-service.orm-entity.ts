import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { AccountOrmEntity } from './account.orm-entity';
import { ServiceOrmEntity } from './service.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('staff_services')
@Unique(['staffId', 'serviceId'])
export class StaffServiceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'ssv';

  @Index()
  @Column('uuid')
  staffId: string;

  @Index()
  @Column('uuid')
  serviceId: string;

  @ManyToOne(() => AccountOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff?: AccountOrmEntity;

  @ManyToOne(() => ServiceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service?: ServiceOrmEntity;
}
