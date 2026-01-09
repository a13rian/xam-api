import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('refresh_tokens')
export class RefreshTokenOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'rtk';

  @Column()
  @Index()
  token: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;
}
