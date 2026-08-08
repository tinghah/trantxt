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
import { User } from './User';
import { Translation } from './Translation';

@Entity('documents')
@Index(['userId'])
@Index(['uploadDate'])
export class Document {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 50 })
  originalFormat: string;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'bigint' })
  fileSizeBytes: number;

  @CreateDateColumn({ type: 'timestamp' })
  uploadDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceLanguage: string;

  @Column({ type: 'integer', default: 1 })
  pageCount: number;

  @Column({ type: 'boolean', default: false })
  hasImages: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Translation, (trans) => trans.document, { cascade: true })
  translations: Translation[];
}
