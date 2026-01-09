import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { AccountOrmEntity } from './account.orm-entity';
import { ServiceOrmEntity } from './service.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('staff_services')
@Unique(['staffId', 'serviceId'])
export class StaffServiceOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'ssv';

  @Index()
  @Column('varchar', { length: 255 })
  staffId: string;

  @Index()
  @Column('varchar', { length: 255 })
  serviceId: string;

  @ManyToOne(() => AccountOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff?: AccountOrmEntity;

  @ManyToOne(() => ServiceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service?: ServiceOrmEntity;
}
