import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

function getEmailConfig() {
  return {
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM ?? 'Captiq AI <noreply@captiq.ai>',
  };
}

function friendlyResendMessage(status: number, bodyText: string): string {
  const lower = bodyText.toLowerCase();

  if (
    status === 403 ||
    lower.includes('only send testing emails') ||
    lower.includes('verify a domain') ||
    lower.includes('not verified')
  ) {
    return (
      'Unable to send email. With Resend test mode (onboarding@resend.dev), ' +
      'you can only send to your Resend account email. Verify a domain or use that address.'
    );
  }

  if (status === 401 || lower.includes('api key')) {
    return 'Unable to send email. Check that RESEND_API_KEY is valid.';
  }

  return 'Unable to send password reset email right now. Please try again later.';
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
): Promise<void> {
  const { resendApiKey, from } = getEmailConfig();

  if (!resendApiKey) {
    if (env.NODE_ENV === 'production') {
      throw new AppError(503, 'Email delivery is not configured');
    }

    // Dev/test only: never log the reset code.
    logger.info(
      { recipientDomain: email.includes('@') ? email.split('@')[1] : 'unknown' },
      'Password reset email skipped — set RESEND_API_KEY to send mail',
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
      subject: 'Your Captiq AI reset code',
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1b1b26;">
          <h1 style="color: #422cd8; font-size: 24px;">Reset your password</h1>
          <p style="font-size: 16px; line-height: 24px; color: #474555;">
            We received a request to reset the password for your Captiq AI account.
            Enter this code in the app. It expires in 15 minutes.
          </p>
          <p style="margin: 32px 0; text-align: center;">
            <span style="display: inline-block; background: #f3f0ff; color: #422cd8; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 24px; border-radius: 16px;">
              ${code}
            </span>
          </p>
          <p style="font-size: 14px; line-height: 20px; color: #777587;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    let resendMessage: string | undefined;

    try {
      const parsed = JSON.parse(bodyText) as { message?: string };
      resendMessage = parsed.message;
    } catch {
      resendMessage = bodyText.slice(0, 300) || undefined;
    }

    logger.error(
      {
        status: response.status,
        resendMessage,
        from,
        recipientDomain: email.includes('@') ? email.split('@')[1] : 'unknown',
      },
      'Failed to send password reset email',
    );

    throw new AppError(
      502,
      friendlyResendMessage(response.status, resendMessage ?? bodyText),
      'EMAIL_DELIVERY_FAILED',
    );
  }
}
