import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Check if environment variables are configured
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        if (!emailUser || !emailPass) {
            console.log(`[Mock Subscription] New subscriber: ${email}`);
            console.log('To enable real emails, configure EMAIL_USER and EMAIL_PASS in .env.local');

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return NextResponse.json({
                success: true,
                message: 'Subscription successful (Mock Mode - Check Console)'
            });
        }

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        // Email content
        const mailOptions = {
            from: emailUser,
            to: 'monsur286512@gmail.com', // User specified destination
            subject: 'New Newsletter Subscription 🚀',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">New Subscriber! 🎉</h2>
          <p>A new user has subscribed to the newsletter.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>Email:</strong> ${email}
          </div>
          <p style="color: #666; font-size: 12px;">Sent from DevToolkit Footer</p>
        </div>
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: 'Subscription successful'
        });

    } catch (error) {
        console.error('Subscription error:', error);
        return NextResponse.json(
            { error: 'Failed to process subscription' },
            { status: 500 }
        );
    }
}
