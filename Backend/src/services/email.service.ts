import { logger } from '../utils/logger.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

function getEmailConfig() {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim(),
    from: process.env.EMAIL_FROM?.trim() ?? 'Captiq AI <noreply@captiq.ai>',
    appPublicUrl: process.env.APP_PUBLIC_URL?.trim() ?? 'captiq://reset-password',
  };
}

export function buildPasswordResetUrl(token: string): string {
  const { appPublicUrl } = getEmailConfig();
  const separator = appPublicUrl.includes('?') ? '&' : '?';
  return `${appPublicUrl}${separator}token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
): Promise<void> {
  const { resendApiKey, from } = getEmailConfig();

  if (!resendApiKey) {
    logger.info(
      { email, resetUrl },
      'Password reset email skipped — configure RESEND_API_KEY to send emails',
    );
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Reset your Captiq AI password',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1b1b26;">
          <h1 style="color: #422cd8; font-size: 24px;">Reset your password</h1>
          <p style="font-size: 16px; line-height: 24px; color: #474555;">
            We received a request to reset the password for your Captiq AI account.
            Tap the button below to choose a new password. This link expires in 1 hour.
          </p>
          <p style="margin: 32px 0;">
            <a href="${resetUrl}" style="background: #422cd8; color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 16px; font-weight: 600; display: inline-block;">
              Reset password
            </a>
          </p>
          <p style="font-size: 14px; line-height: 20px; color: #777587;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.error({ status: response.status, body }, 'Failed to send password reset email');
    throw new Error('Unable to send password reset email');
  }
}
