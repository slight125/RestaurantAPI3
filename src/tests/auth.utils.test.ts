import { AuthUtils } from '../utils/auth';

describe('AuthUtils', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'Password123';
      const hashedPassword = await AuthUtils.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 characters
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Password123';
      const hash1 = await AuthUtils.hashPassword(password);
      const hash2 = await AuthUtils.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt, hashes should be different
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'Password123';
      const hashedPassword = await AuthUtils.hashPassword(password);

      const isValid = await AuthUtils.comparePassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'Password123';
      const wrongPassword = 'WrongPassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);

      const isValid = await AuthUtils.comparePassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with default expiration', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'customer' };
      
      // Mock JWT_SECRET for testing
      process.env.JWT_SECRET = 'test-secret-key';

      const token = AuthUtils.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should generate token with custom expiration', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'customer' };
      process.env.JWT_SECRET = 'test-secret-key';

      const token = AuthUtils.generateToken(payload, '1h');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'customer' };
      delete process.env.JWT_SECRET;

      expect(() => AuthUtils.generateToken(payload)).toThrow('JWT_SECRET is not defined in environment variables');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      const payload = { id: 1, email: 'test@example.com', role: 'customer' };
      process.env.JWT_SECRET = 'test-secret-key';

      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);

      expect(decoded).toMatchObject(payload);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('should throw error for invalid token', () => {
      process.env.JWT_SECRET = 'test-secret-key';
      const invalidToken = 'invalid.token.here';

      expect(() => AuthUtils.verifyToken(invalidToken)).toThrow();
    });

    it('should throw error when JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;
      const token = 'some.token.here';

      expect(() => AuthUtils.verifyToken(token)).toThrow('JWT_SECRET is not defined in environment variables');
    });
  });

  describe('generateResetToken', () => {
    it('should generate random reset token', () => {
      const token1 = AuthUtils.generateResetToken();
      const token2 = AuthUtils.generateResetToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
      expect(token1).not.toBe(token2); // Should be different each time
      expect(token1.length).toBe(64); // 32 bytes = 64 hex characters
    });
  });

  describe('generateConfirmationCode', () => {
    it('should generate 6-digit confirmation code', () => {
      const code1 = AuthUtils.generateConfirmationCode();
      const code2 = AuthUtils.generateConfirmationCode();

      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
      expect(typeof code1).toBe('string');
      expect(typeof code2).toBe('string');
      expect(code1.length).toBe(6);
      expect(code2.length).toBe(6);
      expect(/^\d{6}$/.test(code1)).toBe(true); // Should be 6 digits
      expect(/^\d{6}$/.test(code2)).toBe(true);
    });

    it('should generate codes in valid range', () => {
      for (let i = 0; i < 100; i++) {
        const code = AuthUtils.generateConfirmationCode();
        const numCode = parseInt(code);
        expect(numCode).toBeGreaterThanOrEqual(100000);
        expect(numCode).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(AuthUtils.isValidEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid emails', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user name@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(AuthUtils.isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test123456',
        'Abcdefgh1',
      ];

      validPasswords.forEach(password => {
        expect(AuthUtils.isValidPassword(password)).toBe(true);
      });
    });

    it('should return false for invalid passwords', () => {
      const invalidPasswords = [
        'short1A', // Too short
        'password123', // No uppercase
        'PASSWORD123', // No lowercase
        'PasswordABC', // No number
        'Pass123', // Too short
        '12345678', // No letters
        'abcdefgh', // No uppercase or number
      ];

      invalidPasswords.forEach(password => {
        expect(AuthUtils.isValidPassword(password)).toBe(false);
      });
    });
  });

  describe('isValidPhone', () => {
    it('should return true for valid phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+1 (234) 567-8900',
        '234-567-8900',
        '+44 20 7946 0958',
        '(555) 123-4567',
      ];

      validPhones.forEach(phone => {
        expect(AuthUtils.isValidPhone(phone)).toBe(true);
      });
    });

    it('should return false for invalid phone numbers', () => {
      const invalidPhones = [
        '123', // Too short
        '12345678901234567890', // Too long
        'abc-def-ghij', // Contains letters
        '123-45-6789', // Wrong format
        '', // Empty
      ];

      invalidPhones.forEach(phone => {
        expect(AuthUtils.isValidPhone(phone)).toBe(false);
      });
    });
  });
});

