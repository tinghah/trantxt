import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import { AuditLog } from '../models/AuditLog';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { encryptionService } from './encryptionService';
import { CONSTANTS } from '../config/constants';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private groupRepository = AppDataSource.getRepository(UserGroup);
  private auditRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Create a new user
   */
  async createUser(
    email: string,
    name: string,
    password: string,
    groupId?: string
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const user = this.userRepository.create({
      email,
      name,
      passwordHash,
      groupId,
      isApproved: false,
      isAdmin: false,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Find user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['group'],
    });
  }

  /**
   * Find user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['group'],
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(userId, { lastLogin: new Date() });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<User>,
    ipAddress: string
  ): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const before = { ...user };
    Object.assign(user, updates);
    const updated = await this.userRepository.save(user);

    await this.logAudit({
      userId,
      action: CONSTANTS.AUDIT_ACTIONS.UPDATE_PROFILE,
      resourceType: CONSTANTS.RESOURCE_TYPES.USER,
      resourceId: userId,
      changes: { before, after: updates },
      ipAddress,
      status: 'success',
    });

    return updated;
  }

  /**
   * Approve user
   */
  async approveUser(userId: string, adminId: string, ipAddress: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isApproved = true;
    const updated = await this.userRepository.save(user);

    await this.logAudit({
      userId: adminId,
      action: 'approve_user',
      resourceType: CONSTANTS.RESOURCE_TYPES.USER,
      resourceId: userId,
      changes: { isApproved: true },
      ipAddress,
      status: 'success',
    });

    return updated;
  }

  /**
   * Assign user to group
   */
  async assignToGroup(userId: string, groupId: string, adminId: string, ipAddress: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    user.groupId = groupId;
    const updated = await this.userRepository.save(user);

    await this.logAudit({
      userId: adminId,
      action: 'assign_to_group',
      resourceType: CONSTANTS.RESOURCE_TYPES.USER,
      resourceId: userId,
      changes: { groupId },
      ipAddress,
      status: 'success',
    });

    return updated;
  }

  /**
   * Generate API key for user
   */
  async generateApiKey(userId: string): Promise<string> {
    const apiKey = uuidv4();
    const apiKeyHash = encryptionService.hashApiKey(apiKey);

    await this.userRepository.update(userId, {
      apiKey: encryptionService.encryptData(apiKey),
      apiKeyHash,
    });

    return apiKey;
  }

  /**
   * Verify API key
   */
  async verifyApiKey(apiKey: string): Promise<User | null> {
    const apiKeyHash = encryptionService.hashApiKey(apiKey);
    return await this.userRepository.findOne({
      where: { apiKeyHash },
      relations: ['group'],
    });
  }

  /**
   * Get all users (paginated)
   */
  async getAllUsers(page: number, limit: number): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['group'],
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, adminId: string, ipAddress: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.logAudit({
      userId: adminId,
      action: CONSTANTS.AUDIT_ACTIONS.DELETE_USER,
      resourceType: CONSTANTS.RESOURCE_TYPES.USER,
      resourceId: userId,
      changes: { user },
      ipAddress,
      status: 'success',
    });

    await this.userRepository.remove(user);
  }

  /**
   * Log audit event
   */
  private async logAudit(data: Partial<AuditLog>): Promise<void> {
    const auditLog = this.auditRepository.create(data);
    await this.auditRepository.save(auditLog);
  }
}

export const userService = new UserService();
