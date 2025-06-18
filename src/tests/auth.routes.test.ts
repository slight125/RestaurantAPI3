import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth.routes';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';

// Mock services
jest.mock('../services/auth.service');
jest.mock('../services/email.service');

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockEmailService = EmailService as jest.Mocked<typeof EmailService>;

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register user successfully with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'customer',
      };

      const mockResult = {
        user: {
          id: 1,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          confirmationCode: '123456',
          emailVerified: false,
          phoneVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(mockResult);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBe('jwt-token');
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        email: 'john@example.com',
        // Missing name and password
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const mockResult = {
        user: {
          id: 1,
          name: 'John Doe',
          email: credentials.email,
          role: 'customer',
          emailVerified: true,
          phoneVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);
      expect(response.body.data.token).toBe('jwt-token');
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should return 400 for invalid email format', async () => {
      const credentials = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for missing password', async () => {
      const credentials = {
        email: 'john@example.com',
        // Missing password
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should verify email successfully with valid code', async () => {
      const verificationData = {
        userId: 1,
        confirmationCode: '123456',
      };

      mockAuthService.verifyEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/verify-email')
        .send(verificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        verificationData.userId,
        verificationData.confirmationCode
      );
    });

    it('should return 400 for invalid confirmation code', async () => {
      const verificationData = {
        userId: 1,
        confirmationCode: 'invalid',
      };

      mockAuthService.verifyEmail.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/verify-email')
        .send(verificationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid confirmation code or user not found');
    });

    it('should return 400 for invalid userId type', async () => {
      const verificationData = {
        userId: 'invalid',
        confirmationCode: '123456',
      };

      const response = await request(app)
        .post('/auth/verify-email')
        .send(verificationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/request-password-reset', () => {
    it('should send password reset email for existing user', async () => {
      const resetData = {
        email: 'john@example.com',
      };

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: resetData.email,
      };

      mockAuthService.requestPasswordReset.mockResolvedValue('reset-token-123');
      mockAuthService.getUserByEmail.mockResolvedValue(mockUser as any);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/request-password-reset')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset email sent successfully');
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(resetData.email);
    });

    it('should return 404 for non-existent user', async () => {
      const resetData = {
        email: 'nonexistent@example.com',
      };

      mockAuthService.requestPasswordReset.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/request-password-reset')
        .send(resetData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email not found');
    });

    it('should return 400 for invalid email format', async () => {
      const resetData = {
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/auth/request-password-reset')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password successfully with valid token', async () => {
      const resetData = {
        token: 'valid-reset-token',
        newPassword: 'NewPassword123',
      };

      mockAuthService.resetPassword.mockResolvedValue(true);

      const response = await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password reset successfully');
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetData.token,
        resetData.newPassword
      );
    });

    it('should return 400 for invalid or expired token', async () => {
      const resetData = {
        token: 'invalid-token',
        newPassword: 'NewPassword123',
      };

      mockAuthService.resetPassword.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 for weak new password', async () => {
      const resetData = {
        token: 'valid-token',
        newPassword: 'weak',
      };

      const response = await request(app)
        .post('/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});

