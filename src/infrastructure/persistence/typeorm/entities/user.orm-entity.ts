import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';
import { GenderEnum } from '../../../../core/domain/user/value-objects/gender.vo';

@Entity('users')
export class UserOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'usr';

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: GenderEnum | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @ManyToMany(() => RoleOrmEntity, { cascade: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleOrmEntity[];

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date | null;

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      bookingReminders: true,
    },
  })
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
    bookingReminders: boolean;
  };
}
