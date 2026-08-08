import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('translation_api_keys')
@Index(['provider'])
@Index(['isActive'])
export class TranslationApiKey {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ type: 'text' })
  apiKeyEncrypted: string;

  @Column({ type: 'text', nullable: true })
  apiSecretEncrypted: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid' })
  createdByAdmin: string;
}
