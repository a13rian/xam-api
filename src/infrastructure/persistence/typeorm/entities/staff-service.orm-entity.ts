import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { PartnerStaffOrmEntity } from './partner-staff.orm-entity';
import { ServiceOrmEntity } from './service.orm-entity';

@Entity('staff_services')
@Unique(['staffId', 'serviceId'])
export class StaffServiceOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  staffId: string;

  @Index()
  @Column('uuid')
  serviceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => PartnerStaffOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff?: PartnerStaffOrmEntity;

  @ManyToOne(() => ServiceOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service?: ServiceOrmEntity;
}
