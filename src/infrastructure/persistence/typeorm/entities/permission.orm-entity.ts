import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('permissions')
export class PermissionOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'prm';

  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  @Index()
  resource: string;

  @Column()
  action: string;

  @ManyToMany(() => RoleOrmEntity, (role) => role.permissions)
  roles: RoleOrmEntity[];
}
