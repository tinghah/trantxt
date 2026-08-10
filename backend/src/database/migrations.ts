import { AppDataSource } from '../config/database';
import { env } from '../config/env';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import { Language } from '../models/Language';
import bcrypt from 'bcryptjs';

/**
 * Default languages. Enabled by default: English, Burmese, Chinese (Traditional),
 * Chinese (Simplified), Vietnamese, Bengali. All others disabled until admin enables.
 */
const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', enabled: true, sort: 1 },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', enabled: true, sort: 2 },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', enabled: true, sort: 3 },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', enabled: true, sort: 4 },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', enabled: true, sort: 5 },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', enabled: true, sort: 6 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: false, sort: 7 },
  { code: 'fr', name: 'French', nativeName: 'Français', enabled: false, sort: 8 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', enabled: false, sort: 9 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', enabled: false, sort: 10 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: false, sort: 11 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: false, sort: 12 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: false, sort: 13 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', enabled: false, sort: 14 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: false, sort: 15 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', enabled: false, sort: 16 },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', enabled: false, sort: 17 },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', enabled: false, sort: 18 },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', enabled: false, sort: 19 },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', enabled: false, sort: 20 },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', enabled: false, sort: 21 },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', enabled: false, sort: 22 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', enabled: false, sort: 23 },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', enabled: false, sort: 24 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', enabled: false, sort: 25 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', enabled: false, sort: 26 },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', enabled: false, sort: 27 },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', enabled: false, sort: 28 },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', enabled: false, sort: 29 },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', enabled: false, sort: 30 },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', enabled: false, sort: 31 },
];

/**
 * Seed the database with default data:
 * - Creates a default user group
 * - Creates the admin user (isAdmin = true, isApproved = true)
 * - Seeds languages
 * - Creates "Users" group for regular users
 */
export const seedDatabase = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const groupRepository = AppDataSource.getRepository(UserGroup);
  const languageRepository = AppDataSource.getRepository(Language);

  // 1. Create Administrators group if it doesn't exist
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

  // 2. Create Users group if it doesn't exist
  let usersGroup = await groupRepository.findOne({ where: { name: 'Users' } });
  if (!usersGroup) {
    usersGroup = groupRepository.create({
      name: 'Users',
      description: 'Default group for regular users',
      monthlyPageLimit: 1000,
      fileSizeLimitMb: 25,
      concurrentUploads: 5,
      tokenQuota: 100000,
      translationApisAllowed: ['google', 'deepl', 'azure'],
    });
    usersGroup = await groupRepository.save(usersGroup);
    console.log('✅ Created default "Users" group');
  }

  // 3. Create admin user if it doesn't exist
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

  // 4. Seed languages
  for (const lang of DEFAULT_LANGUAGES) {
    const existing = await languageRepository.findOne({ where: { code: lang.code } });
    if (!existing) {
      await languageRepository.save(
        languageRepository.create({
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          isEnabled: lang.enabled,
          sortOrder: lang.sort,
        })
      );
    }
  }
  console.log(`✅ Seeded ${DEFAULT_LANGUAGES.length} languages`);
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
