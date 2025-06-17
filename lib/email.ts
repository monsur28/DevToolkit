import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@devtoolkit.com',
      to: email,
      subject: 'Verify Your DevToolkit Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to DevToolkit!</h2>
          <p>Thank you for registering with DevToolkit. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create an account with DevToolkit, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@devtoolkit.com',
      to: email,
      subject: 'Reset Your DevToolkit Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>You requested to reset your password for your DevToolkit account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  static async sendAdminResponseEmail(email: string, suggestionTitle: string, adminResponse: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@devtoolkit.com',
      to: email,
      subject: `Response to your suggestion: ${suggestionTitle}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Admin Response</h2>
          <p>We've reviewed your suggestion titled "<strong>${suggestionTitle}</strong>" and here's our response:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p style="margin: 0;">${adminResponse}</p>
          </div>
          <p>Thank you for helping us improve DevToolkit!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Admin response email sent successfully');
    } catch (error) {
      console.error('Error sending admin response email:', error);
      throw error;
    }
  }
}