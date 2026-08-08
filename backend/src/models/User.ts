import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Document } from './Document';
import { Translation } from './Translation';
import { UsageMetrics } from './UsageMetrics';
import { AuditLog } from './AuditLog';
import { UserGroup } from './UserGroup';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['createdAt'])
export class User {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'uuid', nullable: true })
  groupId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiKeyHash: string;

  @ManyToOne(() => UserGroup, { nullable: true, onDelete: 'SET NULL' })
  group: UserGroup;

  @OneToMany(() => Document, (doc) => doc.user, { cascade: true })
  documents: Document[];

  @OneToMany(() => Translation, (trans) => trans.user, { cascade: true })
  translations: Translation[];

  @OneToMany(() => UsageMetrics, (metrics) => metrics.user, { cascade: true })
  usageMetrics: UsageMetrics[];

  @OneToMany(() => AuditLog, (log) => log.user, { cascade: true })
  auditLogs: AuditLog[];
}
