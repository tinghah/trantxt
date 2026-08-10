import { AppDataSource } from '../config/database';
import { env } from '../config/env';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import bcrypt from 'bcryptjs';

/**
 * Seed the database with default data:
 * - Creates a default user group
 * - Creates the admin user (isAdmin = true, isApproved = true)
 */
export const seedDatabase = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const groupRepository = AppDataSource.getRepository(UserGroup);

  // 1. Create default group if it doesn't exist
  let adminGroup = await groupRepository.findOne({ where: { name: 'Administrators' } });
  if (!adminGroup) {
    adminGroup = groupRepository.create({
      name: 'Administrators',
      description: 'Default administrator group with full access',
      monthlyPageLimit: 10000,
      fileSizeLimitMb: 100,
      concurrentUploads: 20,
      tokenQuota: 1000000,
      translationApisAllowed: ['google', 'deepl', 'azure', 'custom'],
    });
    adminGroup = await groupRepository.save(adminGroup);
    console.log('✅ Created default "Administrators" group');
  }

  // 2. Create admin user if it doesn't exist
  const existingAdmin = await userRepository.findOne({ where: { email: env.ADMIN_EMAIL } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    const admin = userRepository.create({
      email: env.ADMIN_EMAIL,
      name: 'Administrator',
      passwordHash,
      isAdmin: true,
      isApproved: true,
      groupId: adminGroup.id,
    });
    await userRepository.save(admin);
    console.log(`✅ Created admin user: ${env.ADMIN_EMAIL}`);
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation');
  }
};

/**
 * Run migrations and seed data
 */
export const runMigrations = async () => {
  try {
    console.log('Running database migrations...');

    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
      console.log('Database schema synchronized');
    } else {
      console.log('Database ready');
    }

    await seedDatabase();
    console.log('Database setup complete');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};

// Run if executed directly
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
