import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
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
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">DevToolkit</h1>
            <p style="color: #6B7280; margin: 5px 0;">AI-Enhanced Developer Tools</p>
          </div>
          
          <h2 style="color: #1F2937; text-align: center;">Welcome to DevToolkit!</h2>
          <p style="color: #374151; line-height: 1.6;">Thank you for registering with DevToolkit. Please click the button below to verify your email address and start using our AI-powered developer tools:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3B82F6; font-size: 14px; background: #F3F4F6; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              This verification link will expire in 24 hours. If you didn't create an account with DevToolkit, please ignore this email.
            </p>
          </div>
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
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">DevToolkit</h1>
            <p style="color: #6B7280; margin: 5px 0;">AI-Enhanced Developer Tools</p>
          </div>
          
          <h2 style="color: #1F2937; text-align: center;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">You requested to reset your password for your DevToolkit account. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #DC2626; font-size: 14px; background: #F3F4F6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
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
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">DevToolkit</h1>
            <p style="color: #6B7280; margin: 5px 0;">AI-Enhanced Developer Tools</p>
          </div>
          
          <h2 style="color: #1F2937; text-align: center;">Admin Response</h2>
          <p style="color: #374151; line-height: 1.6;">We've reviewed your suggestion titled "<strong>${suggestionTitle}</strong>" and here's our response:</p>
          
          <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); padding: 20px; border-left: 4px solid #3B82F6; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1F2937; line-height: 1.6;">${adminResponse}</p>
          </div>
          
          <p style="color: #374151; line-height: 1.6;">Thank you for helping us improve DevToolkit!</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
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

  static async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@devtoolkit.com',
      to: email,
      subject: 'Welcome to DevToolkit - Your AI-Enhanced Developer Journey Begins!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">DevToolkit</h1>
            <p style="color: #6B7280; margin: 5px 0;">AI-Enhanced Developer Tools</p>
          </div>
          
          <h2 style="color: #1F2937; text-align: center;">Welcome${firstName ? `, ${firstName}` : ''}! 🎉</h2>
          <p style="color: #374151; line-height: 1.6;">Your email has been verified and your DevToolkit account is now active! You now have access to our suite of AI-powered developer tools.</p>
          
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">🚀 What's included in your free account:</h3>
            <ul style="color: #374151; line-height: 1.6; margin: 0;">
              <li>50 AI tool uses per day</li>
              <li>Access to all basic developer tools</li>
              <li>Community support</li>
              <li>Regular feature updates</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tools" style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); margin-right: 10px;">
              Explore AI Tools
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="background: transparent; color: #3B82F6; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; border: 2px solid #3B82F6;">
              View Dashboard
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              Need help getting started? Check out our <a href="${process.env.NEXT_PUBLIC_BASE_URL}/about" style="color: #3B82F6;">documentation</a> or <a href="${process.env.NEXT_PUBLIC_BASE_URL}/contact" style="color: #3B82F6;">contact support</a>.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
}