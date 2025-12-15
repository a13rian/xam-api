import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

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

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @ManyToMany(() => RoleOrmEntity, { cascade: false })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: RoleOrmEntity[];

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;
}
