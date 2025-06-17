import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLogin?: Date;
  usageCount: number;
  dailyUsageLimit: number;
  monthlyUsageLimit: number;
  isActive: boolean;
  lastUsageReset: Date;
}

export interface AuthToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// In-memory storage (replace with database in production)
let users: User[] = [
  {
    id: 'admin-1',
    email: 'admin@devtoolkit.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password: admin123
    isVerified: true,
    role: 'admin',
    createdAt: new Date(),
    usageCount: 0,
    dailyUsageLimit: 1000,
    monthlyUsageLimit: 10000,
    isActive: true,
    lastUsageReset: new Date()
  }
];

let suggestions: Array<{
  id: string;
  userId: string;
  type: 'suggestion' | 'feedback';
  title: string;
  content: string;
  status: 'pending' | 'reviewed' | 'implemented';
  adminResponse?: string;
  createdAt: Date;
  respondedAt?: Date;
}> = [];

let usageHistory: Array<{
  id: string;
  userId: string;
  toolName: string;
  timestamp: Date;
  success: boolean;
}> = [];

let analytics = {
  totalVisitors: 0,
  toolUsage: {},
  newRegistrations: 0,
  activeUsers: 0
};

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch {
      return null;
    }
  }

  static async register(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'User already exists' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    const hashedPassword = await this.hashPassword(password);
    const verificationToken = uuidv4();

    const newUser: User = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      role: 'user',
      createdAt: new Date(),
      usageCount: 0,
      dailyUsageLimit: 50,
      monthlyUsageLimit: 1000,
      isActive: true,
      lastUsageReset: new Date()
    };

    users.push(newUser);
    analytics.newRegistrations++;

    // In production, send verification email here
    console.log(`Verification link: /auth/verify?token=${verificationToken}`);

    return { success: true, message: 'Registration successful. Please check your email for verification.', user: newUser };
  }

  static async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; user?: User }> {
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.isActive) {
      return { success: false, message: 'Account is suspended' };
    }

    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    if (!user.isVerified) {
      return { success: false, message: 'Please verify your email before logging in' };
    }

    user.lastLogin = new Date();
    const token = this.generateToken(user);

    return { success: true, message: 'Login successful', token, user };
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const user = users.find(u => u.verificationToken === token);
    if (!user) {
      return { success: false, message: 'Invalid verification token' };
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    return { success: true, message: 'Email verified successfully' };
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const user = users.find(u => u.email === email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // In production, send reset email here
    console.log(`Password reset link: /auth/reset-password?token=${resetToken}`);

    return { success: true, message: 'Password reset link sent to your email' };
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = users.find(u => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now());
    if (!user) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    if (newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long' };
    }

    user.password = await this.hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    return { success: true, message: 'Password reset successfully' };
  }

  static getUserById(id: string): User | undefined {
    return users.find(u => u.id === id);
  }

  static getAllUsers(): User[] {
    return users.filter(u => u.role === 'user');
  }

  static updateUserUsage(userId: string, toolName: string, success: boolean = true): void {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.usageCount++;
      
      // Reset daily usage if needed
      const today = new Date();
      const lastReset = new Date(user.lastUsageReset);
      if (today.getDate() !== lastReset.getDate()) {
        user.usageCount = 1;
        user.lastUsageReset = today;
      }
    }

    // Add to usage history
    usageHistory.push({
      id: uuidv4(),
      userId,
      toolName,
      timestamp: new Date(),
      success
    });

    // Update analytics
    if (!analytics.toolUsage[toolName]) {
      analytics.toolUsage[toolName] = 0;
    }
    analytics.toolUsage[toolName]++;
  }

  static getUserUsageHistory(userId: string): Array<any> {
    return usageHistory.filter(h => h.userId === userId);
  }

  static canUserUseAI(userId: string): { canUse: boolean; reason?: string } {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { canUse: false, reason: 'User not found' };
    }

    if (!user.isActive) {
      return { canUse: false, reason: 'Account is suspended' };
    }

    if (user.usageCount >= user.dailyUsageLimit) {
      return { canUse: false, reason: 'Daily usage limit exceeded' };
    }

    return { canUse: true };
  }

  static addSuggestion(userId: string, type: 'suggestion' | 'feedback', title: string, content: string): void {
    suggestions.push({
      id: uuidv4(),
      userId,
      type,
      title,
      content,
      status: 'pending',
      createdAt: new Date()
    });
  }

  static getSuggestions(): Array<any> {
    return suggestions;
  }

  static getUserSuggestions(userId: string): Array<any> {
    return suggestions.filter(s => s.userId === userId);
  }

  static respondToSuggestion(suggestionId: string, adminResponse: string): void {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      suggestion.adminResponse = adminResponse;
      suggestion.status = 'reviewed';
      suggestion.respondedAt = new Date();
    }
  }

  static getAnalytics() {
    return {
      ...analytics,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      verifiedUsers: users.filter(u => u.isVerified).length,
      totalUsage: usageHistory.length,
      recentUsage: usageHistory.slice(-100)
    };
  }

  static updateUserStatus(userId: string, isActive: boolean): void {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isActive = isActive;
    }
  }

  static updateUserLimits(userId: string, dailyLimit: number, monthlyLimit: number): void {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.dailyUsageLimit = dailyLimit;
      user.monthlyUsageLimit = monthlyLimit;
    }
  }
}