import { Entity, Column, ManyToMany, JoinTable, Index } from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('roles')
@Index(['name', 'organizationId'], { unique: true })
export class RoleOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'rol';

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: false })
  isSystem: boolean;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  organizationId: string | null;

  @ManyToMany(() => PermissionOrmEntity, (permission) => permission.roles, {
    cascade: false,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: PermissionOrmEntity[];
}
