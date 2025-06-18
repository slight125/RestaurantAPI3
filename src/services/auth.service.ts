import { db } from '../models/db';
import { users, drivers, restaurantOwners } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { AuthUtils } from '../utils/auth';
import { 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse, 
  User 
} from '../types';

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Validate password strength
      if (!AuthUtils.isValidPassword(userData.password)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and number');
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(userData.password);

      // Generate confirmation code
      const confirmationCode = AuthUtils.generateConfirmationCode();

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          contactPhone: userData.contactPhone,
          role: userData.role || 'customer',
          confirmationCode,
          emailVerified: false,
          phoneVerified: false,
        })
        .returning();

      const user = newUser[0];

      // If user is a driver, create driver record
      if (userData.role === 'driver') {
        await db.insert(drivers).values({
          userId: user.id,
          online: false,
          delivering: false,
        });
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, credentials.email))
        .limit(1);

      if (userResult.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = userResult[0];

      // Verify password
      const isPasswordValid = await AuthUtils.comparePassword(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = AuthUtils.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId: number): Promise<User | null> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (userResult.length === 0) {
        return null;
      }

      return userResult[0];
    } catch (error) {
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return null;
      }

      return userResult[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(userId: number, updateData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (updatedUser.length === 0) {
        return null;
      }

      return updatedUser[0];
    } catch (error) {
      throw error;
    }
  }

  static async verifyEmail(userId: number, confirmationCode: string): Promise<boolean> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.confirmationCode, confirmationCode)
          )
        )
        .limit(1);

      if (userResult.length === 0) {
        return false;
      }

      await db
        .update(users)
        .set({
          emailVerified: true,
          confirmationCode: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async requestPasswordReset(email: string): Promise<string | null> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return null;
      }

      const resetToken = AuthUtils.generateResetToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await db
        .update(users)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userResult[0].id));

      return resetToken;
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.passwordResetToken, token))
        .limit(1);

      if (userResult.length === 0) {
        return false;
      }

      const user = userResult[0];

      // Check if token is expired
      if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return false;
      }

      // Validate new password
      if (!AuthUtils.isValidPassword(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and number');
      }

      // Hash new password
      const hashedPassword = await AuthUtils.hashPassword(newPassword);

      // Update password and clear reset token
      await db
        .update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async assignRestaurantOwner(userId: number, restaurantId: number): Promise<void> {
    try {
      // Check if user exists and has restaurant_owner role
      const user = await this.getUserById(userId);
      if (!user || user.role !== 'restaurant_owner') {
        throw new Error('User must have restaurant_owner role');
      }

      // Check if assignment already exists
      const existingAssignment = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.userId, userId),
            eq(restaurantOwners.restaurantId, restaurantId)
          )
        )
        .limit(1);

      if (existingAssignment.length > 0) {
        throw new Error('User is already assigned to this restaurant');
      }

      // Create assignment
      await db.insert(restaurantOwners).values({
        userId,
        restaurantId,
      });
    } catch (error) {
      throw error;
    }
  }
}

