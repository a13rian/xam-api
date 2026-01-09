import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { BaseOrmEntity } from './base.orm-entity';

@Entity('email_verification_tokens')
export class EmailVerificationTokenOrmEntity extends BaseOrmEntity {
  protected readonly idPrefix = 'evt';

  @Column()
  @Index()
  token: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  userId: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;
}
