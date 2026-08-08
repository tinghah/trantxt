import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('audit_logs')
@Index(['userId'])
@Index(['timestamp'])
@Index(['resourceType'])
export class AuditLog {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ type: 'uuid' })
  resourceId: string;

  @Column({ type: 'jsonb', default: {} })
  changes: Record<string, any>;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 50, default: 'success' })
  status: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  user: User;
}
