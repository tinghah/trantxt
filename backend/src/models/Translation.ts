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
import { Document } from './Document';

@Entity('translations')
@Index(['documentId'])
@Index(['userId'])
@Index(['createdAt'])
export class Translation {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'uuid' })
  documentId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  sourceLanguage: string;

  @Column({ type: 'varchar', length: 50 })
  targetLanguage: string;

  @Column({ type: 'jsonb', default: [] })
  targetLanguages: string[];

  @Column({ type: 'jsonb', default: {} })
  originalContent: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  translatedContent: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  tokensUsed: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'jsonb', default: ['pdf'] })
  outputFormats: string[];

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  approvalStatus: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'integer', default: 0 })
  downloadCount: number;

  @ManyToOne(() => User, (user) => user.translations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Document, (doc) => doc.translations, { onDelete: 'CASCADE' })
  document: Document;
}
