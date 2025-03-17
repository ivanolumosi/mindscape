import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // Set to true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Send Email Function
const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        await transporter.sendMail({
            from: `"MindScape Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// ✅ Send Password Reset Email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    const htmlContent = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    await sendEmail(email, 'Password Reset Request', htmlContent);
};

// ✅ Send Verification Code Email
export const sendVerificationCode = async (email: string, verificationCode: string): Promise<void> => {
    const htmlContent = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
    await sendEmail(email, 'Account Verification Code', htmlContent);
};

// ✅ Send Forgot Password Email
export const sendForgotPasswordEmail = async (email: string, resetToken: string): Promise<void> => {
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    const htmlContent = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    await sendEmail(email, 'Forgot Password Request', htmlContent);
};

// ✅ Send Welcome Email
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
    const htmlContent = `<p>Welcome ${name}, we are excited to have you on board!</p>`;
    await sendEmail(email, 'Welcome to MindScape', htmlContent);
};

// ✅ Send Daily Notification Email (If User Opts In)
export const sendDailyNotificationEmail = async (email: string, notifications: string[]): Promise<void> => {
    const htmlContent = `<p>Your daily notifications:</p><ul>${notifications.map(n => `<li>${n}</li>`).join('')}</ul>`;
    await sendEmail(email, 'Your Daily Notifications', htmlContent);
};
