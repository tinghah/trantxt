import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('usage_metrics')
@Index(['userId'])
@Index(['yearMonth'])
export class UsageMetrics {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 7 })
  yearMonth: string;

  @Column({ type: 'integer', default: 0 })
  pagesTranslated: number;

  @Column({ type: 'integer', default: 0 })
  tokensUsed: number;

  @Column({ type: 'integer', default: 0 })
  filesUploaded: number;

  @Column({ type: 'bigint', default: 0 })
  totalSizeBytes: number;

  @Column({ type: 'jsonb', default: {} })
  apiCallsByProvider: Record<string, number>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.usageMetrics, { onDelete: 'CASCADE' })
  user: User;
}
