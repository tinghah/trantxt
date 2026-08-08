import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('user_groups')
@Index(['name'], { unique: true })
export class UserGroup {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer', default: 100 })
  monthlyPageLimit: number;

  @Column({ type: 'integer', default: 50 })
  fileSizeLimitMb: number;

  @Column({ type: 'integer', default: 5 })
  concurrentUploads: number;

  @Column({ type: 'integer', default: 10000 })
  tokenQuota: number;

  @Column({ type: 'jsonb', default: ['google', 'deepl'] })
  translationApisAllowed: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.group, { cascade: true })
  users: User[];
}
