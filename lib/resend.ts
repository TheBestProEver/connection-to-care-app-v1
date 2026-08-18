import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_placeholder_change_me') {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  mode: 'LIVE_RESEND' | 'SIMULATED_DEV';
  error?: string;
}

/**
 * Sends an email using the Resend API or logs gracefully in development mock mode
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = 'Connection to Care <referrals@c2c-health.org>',
}: SendEmailParams): Promise<EmailSendResult> {
  const client = getResendClient();
  const recipient = Array.isArray(to) ? to.join(', ') : to;

  if (client) {
    try {
      const response = await client.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      });

      if (response.error) {
        console.error('[Resend API Error]:', response.error);
        return {
          success: false,
          mode: 'LIVE_RESEND',
          error: response.error.message,
        };
      }

      console.log(`[Resend LIVE Sent] To: ${recipient} | Subject: "${subject}" | ID: ${response.data?.id}`);
      return {
        success: true,
        messageId: response.data?.id,
        mode: 'LIVE_RESEND',
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown Resend error';
      console.error('[Resend Exception]:', errorMessage);
      return {
        success: false,
        mode: 'LIVE_RESEND',
        error: errorMessage,
      };
    }
  }

  // Fallback Dev Simulation Mode
  const simulatedId = `mock_msg_${Math.random().toString(36).substring(2, 10)}`;
  console.log(`[Resend DEV SIMULATED] To: ${recipient} | Subject: "${subject}" | MockID: ${simulatedId}`);
  
  return {
    success: true,
    messageId: simulatedId,
    mode: 'SIMULATED_DEV',
  };
}
