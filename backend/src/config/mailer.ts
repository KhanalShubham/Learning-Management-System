import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'Reset your Deukhuri Digital Campus password',
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes. If you did not request this, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    logger.error(`Failed to send password reset email to ${to}`);
    logger.error(error instanceof Error ? error.message : String(error));
  }
};
