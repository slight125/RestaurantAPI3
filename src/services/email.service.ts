import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  static async sendWelcomeEmail(email: string, name: string, confirmationCode: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Restaurant Management System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to Restaurant Management System!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Restaurant Management System!</h1>
            
            <p>Dear ${name},</p>
            
            <p>Thank you for registering with our Restaurant Management System. We're excited to have you on board!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Email Verification Required</h3>
              <p>To complete your registration, please verify your email address using the confirmation code below:</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
                  ${confirmationCode}
                </span>
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in 24 hours.</p>
            </div>
            
            <h3 style="color: #333;">What's Next?</h3>
            <ul>
              <li>Verify your email address using the code above</li>
              <li>Complete your profile setup</li>
              <li>Start exploring restaurants and placing orders</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            The Restaurant Management System Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Restaurant Management System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
            
            <p>Dear ${name},</p>
            
            <p>We received a request to reset your password for your Restaurant Management System account.</p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Reset Your Password</h3>
              <p>Click the button below to reset your password. This link will expire in 1 hour for security reasons.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 14px; color: #856404;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #856404; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #721c24; margin: 0; font-weight: bold;">Security Notice:</p>
              <p style="color: #721c24; margin: 5px 0 0 0;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <p>For security reasons, this reset link will expire in 1 hour. If you need to reset your password after that, please request a new reset link.</p>
            
            <p>If you have any questions or concerns, please contact our support team.</p>
            
            <p>Best regards,<br>
            The Restaurant Management System Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  static async sendOrderConfirmationEmail(
    email: string, 
    name: string, 
    orderDetails: {
      orderId: number;
      restaurant: string;
      items: Array<{ name: string; quantity: number; price: string }>;
      totalPrice: string;
      estimatedDeliveryTime: Date;
    }
  ): Promise<boolean> {
    try {
      const itemsHtml = orderDetails.items.map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: `"Restaurant Management System" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Order Confirmation #${orderDetails.orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745; text-align: center;">Order Confirmed!</h1>
            
            <p>Dear ${name},</p>
            
            <p>Thank you for your order! We've received your order and it's being prepared.</p>
            
            <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
              <p><strong>Restaurant:</strong> ${orderDetails.restaurant}</p>
              <p><strong>Estimated Delivery:</strong> ${orderDetails.estimatedDeliveryTime.toLocaleString()}</p>
            </div>
            
            <h3 style="color: #333;">Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td style="padding: 12px; border-top: 2px solid #dee2e6;" colspan="2">Total</td>
                  <td style="padding: 12px; border-top: 2px solid #dee2e6; text-align: right;">$${orderDetails.totalPrice}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="background-color: #cce5ff; border: 1px solid #99d6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #004085; margin: 0; font-weight: bold;">Track Your Order:</p>
              <p style="color: #004085; margin: 5px 0 0 0;">
                You can track your order status in real-time through our app or website.
              </p>
            </div>
            
            <p>We'll send you updates as your order progresses. If you have any questions about your order, please contact us.</p>
            
            <p>Thank you for choosing our Restaurant Management System!</p>
            
            <p>Best regards,<br>
            The Restaurant Management System Team</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666; text-align: center;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

