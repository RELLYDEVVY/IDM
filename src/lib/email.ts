import sgMail from '@sendgrid/mail';

// Only set the API key if it exists to avoid crashing on startup
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@cloudguard.com';

export async function sendVerificationEmail(to: string, token: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY is not set. Skipping verification email to:', to);
    return;
  }

  // Use the NEXT_PUBLIC_APP_URL if defined, otherwise fallback to localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationLink = `${appUrl}/api/auth/verify-email?token=${token}`;

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: 'Verify your CloudGuard Account',
    text: `Welcome to CloudGuard! Please verify your email by clicking the following link: ${verificationLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to CloudGuard</h2>
        <p>Thanks for signing up! Please verify your email address to get started.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${verificationLink}</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending SendGrid email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    // We don't want to throw and crash the registration, just log it
  }
}
