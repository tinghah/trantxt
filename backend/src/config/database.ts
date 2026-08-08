import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import { Document } from '../models/Document';
import { Translation } from '../models/Translation';
import { UsageMetrics } from '../models/UsageMetrics';
import { AuditLog } from '../models/AuditLog';
import { TranslationApiKey } from '../models/TranslationApiKey';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, UserGroup, Document, Translation, UsageMetrics, AuditLog, TranslationApiKey],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
