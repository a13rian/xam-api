import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { DayOfWeek } from '../../../../core/domain/location/entities/operating-hours.entity';
import { OrganizationLocationOrmEntity } from './organization-location.orm-entity';

@Entity('operating_hours')
@Unique(['locationId', 'dayOfWeek'])
export class OperatingHoursOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  locationId: string;

  @Column({ type: 'smallint' })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time' })
  openTime: string;

  @Column({ type: 'time' })
  closeTime: string;

  @Column({ default: false })
  isClosed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => OrganizationLocationOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locationId' })
  location?: OrganizationLocationOrmEntity;
}
