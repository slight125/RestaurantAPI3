import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { ApiResponse, CreateUserRequest, LoginRequest } from '../types';
import { asyncHandler } from '../middleware/error';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const userData: CreateUserRequest = req.body;
    
    const result = await AuthService.register(userData);
    
    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(
        result.user.email,
        result.user.name,
        result.user.confirmationCode || ''
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the registration if email fails
    }
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'User registered successfully. Please check your email for verification code.'
    };
    
    res.status(201).json(response);
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const credentials: LoginRequest = req.body;
    
    const result = await AuthService.login(credentials);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Login successful'
    };
    
    res.status(200).json(response);
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const user = await AuthService.getUserById(req.user.id);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    const response: ApiResponse<typeof userWithoutPassword> = {
      success: true,
      data: userWithoutPassword
    };
    
    res.status(200).json(response);
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.emailVerified;
    delete updateData.phoneVerified;
    
    const updatedUser = await AuthService.updateUser(req.user.id, updateData);
    
    if (!updatedUser) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    const response: ApiResponse<typeof userWithoutPassword> = {
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
    };
    
    res.status(200).json(response);
  });

  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { userId, confirmationCode } = req.body;
    
    const isVerified = await AuthService.verifyEmail(userId, confirmationCode);
    
    if (!isVerified) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid confirmation code or user not found'
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };
    
    res.status(200).json(response);
  });

  static requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    const resetToken = await AuthService.requestPasswordReset(email);
    
    if (!resetToken) {
      const response: ApiResponse = {
        success: false,
        error: 'User with this email not found'
      };
      return res.status(404).json(response);
    }
    
    // Send password reset email
    try {
      const user = await AuthService.getUserByEmail(email);
      if (user) {
        await EmailService.sendPasswordResetEmail(
          email,
          user.name,
          resetToken
        );
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent successfully'
    };
    
    res.status(200).json(response);
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    
    const isReset = await AuthService.resetPassword(token, newPassword);
    
    if (!isReset) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid or expired reset token'
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully'
    };
    
    res.status(200).json(response);
  });
}

