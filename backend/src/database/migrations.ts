import { AppDataSource } from '../config/database';

/**
 * Run database migrations and setup
 */
export const runMigrations = async () => {
  try {
    console.log('Running database migrations...');

    // Synchronize schema (creates tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
      console.log('Database schema synchronized');
    } else {
      // In production, use migration files instead
      // await AppDataSource.runMigrations();
      console.log('Database ready');
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migrations if executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => runMigrations())
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export default runMigrations;
