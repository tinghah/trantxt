import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/trantxt',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long!',
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY || '',
  DEEPL_API_KEY: process.env.DEEPL_API_KEY || '',
  AZURE_TRANSLATOR_KEY: process.env.AZURE_TRANSLATOR_KEY || '',
  AZURE_TRANSLATOR_ENDPOINT: process.env.AZURE_TRANSLATOR_ENDPOINT || '',
  FILE_UPLOAD_DIR: process.env.FILE_UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  JWT_EXPIRE: process.env.JWT_EXPIRE || '1h',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
};
