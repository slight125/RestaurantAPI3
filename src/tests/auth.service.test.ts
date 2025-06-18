import { AuthService } from '../services/auth.service';
import { AuthUtils } from '../utils/auth';
import { db } from '../models/db';
import { users } from '../models/schema';

// Mock the database
jest.mock('../models/db');
const mockDb = db as jest.Mocked<typeof db>;

// Mock AuthUtils
jest.mock('../utils/auth');
const mockAuthUtils = AuthUtils as jest.Mocked<typeof AuthUtils>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'customer' as const,
      };

      const hashedPassword = 'hashedPassword123';
      const confirmationCode = '123456';
      const token = 'jwt-token';

      // Mock database responses
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]), // No existing user
          }),
        }),
      } as any);

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{
            id: 1,
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            confirmationCode,
            emailVerified: false,
            phoneVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }]),
        }),
      } as any);

      // Mock AuthUtils
      mockAuthUtils.isValidPassword.mockReturnValue(true);
      mockAuthUtils.hashPassword.mockResolvedValue(hashedPassword);
      mockAuthUtils.generateConfirmationCode.mockReturnValue(confirmationCode);
      mockAuthUtils.generateToken.mockReturnValue(token);

      const result = await AuthService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBe(token);
      expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockAuthUtils.generateToken).toHaveBeenCalledWith({
        id: 1,
        email: userData.email,
        role: userData.role,
      });
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'customer' as const,
      };

      // Mock existing user
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 1, email: userData.email }]),
          }),
        }),
      } as any);

      await expect(AuthService.register(userData)).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for invalid password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        role: 'customer' as const,
      };

      // Mock no existing user
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockAuthUtils.isValidPassword.mockReturnValue(false);

      await expect(AuthService.register(userData)).rejects.toThrow('Password must be at least 8 characters long and contain uppercase, lowercase, and number');
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const user = {
        id: 1,
        name: 'John Doe',
        email: credentials.email,
        password: 'hashedPassword123',
        role: 'customer',
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = 'jwt-token';

      // Mock database response
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([user]),
          }),
        }),
      } as any);

      // Mock AuthUtils
      mockAuthUtils.comparePassword.mockResolvedValue(true);
      mockAuthUtils.generateToken.mockReturnValue(token);

      const result = await AuthService.login(credentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(credentials.email);
      expect(result.token).toBe(token);
      expect(mockAuthUtils.comparePassword).toHaveBeenCalledWith(credentials.password, user.password);
    });

    it('should throw error for invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      // Mock no user found
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: 1,
        email: credentials.email,
        password: 'hashedPassword123',
      };

      // Mock database response
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([user]),
          }),
        }),
      } as any);

      // Mock password comparison failure
      mockAuthUtils.comparePassword.mockResolvedValue(false);

      await expect(AuthService.login(credentials)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully with valid code', async () => {
      const userId = 1;
      const confirmationCode = '123456';

      // Mock user found with matching code
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: userId, confirmationCode }]),
          }),
        }),
      } as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const result = await AuthService.verifyEmail(userId, confirmationCode);

      expect(result).toBe(true);
    });

    it('should return false for invalid confirmation code', async () => {
      const userId = 1;
      const confirmationCode = 'invalid';

      // Mock no user found with matching code
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await AuthService.verifyEmail(userId, confirmationCode);

      expect(result).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      const email = 'john@example.com';
      const resetToken = 'reset-token-123';

      // Mock user found
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 1, email }]),
          }),
        }),
      } as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      mockAuthUtils.generateResetToken.mockReturnValue(resetToken);

      const result = await AuthService.requestPasswordReset(email);

      expect(result).toBe(resetToken);
      expect(mockAuthUtils.generateResetToken).toHaveBeenCalled();
    });

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com';

      // Mock no user found
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await AuthService.requestPasswordReset(email);

      expect(result).toBe(null);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123';
      const hashedPassword = 'hashedNewPassword';

      const user = {
        id: 1,
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour from now
      };

      // Mock user found with valid token
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([user]),
          }),
        }),
      } as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      mockAuthUtils.isValidPassword.mockReturnValue(true);
      mockAuthUtils.hashPassword.mockResolvedValue(hashedPassword);

      const result = await AuthService.resetPassword(token, newPassword);

      expect(result).toBe(true);
      expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith(newPassword);
    });

    it('should return false for invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'NewPassword123';

      // Mock no user found with token
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await AuthService.resetPassword(token, newPassword);

      expect(result).toBe(false);
    });

    it('should return false for expired token', async () => {
      const token = 'expired-token';
      const newPassword = 'NewPassword123';

      const user = {
        id: 1,
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() - 3600000), // 1 hour ago (expired)
      };

      // Mock user found with expired token
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([user]),
          }),
        }),
      } as any);

      const result = await AuthService.resetPassword(token, newPassword);

      expect(result).toBe(false);
    });
  });
});

