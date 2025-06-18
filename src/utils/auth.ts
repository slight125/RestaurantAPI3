import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: object, expiresIn: string = '7d'): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, secret);
  }

  static generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  static generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static isValidPhone(phone: string): boolean {
    // Basic phone validation (10-15 digits)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }
}

