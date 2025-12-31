import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const notificationEmail = process.env.NOTIFICATION_EMAIL || 'hello@fakesol.com';

let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
  console.log('✅ Email notifications enabled');
} else {
  console.log('⚠️ RESEND_API_KEY not set - email notifications disabled');
}

export interface ProjectSubmission {
  name: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  contact?: string;
  incentive?: string;
}

export async function sendProjectSubmissionNotification(project: ProjectSubmission): Promise<boolean> {
  if (!resend) {
    console.log('Email skipped: Resend not configured');
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: 'FakeSOL <notifications@fakesol.com>',
      to: [notificationEmail],
      subject: `New Project Submission: ${project.name}`,
      html: `
        <h2>New Project Submitted to FakeSOL</h2>
        <p><strong>Name:</strong> ${project.name}</p>
        <p><strong>URL:</strong> <a href="${project.url}">${project.url}</a></p>
        <p><strong>Category:</strong> ${project.category}</p>
        <p><strong>Description:</strong> ${project.description}</p>
        <p><strong>Tags:</strong> ${project.tags.join(', ') || 'None'}</p>
        ${project.contact ? `<p><strong>Contact:</strong> ${project.contact}</p>` : ''}
        ${project.incentive ? `<p><strong>Incentive:</strong> ${project.incentive}</p>` : ''}
        <hr>
        <p style="color: #666; font-size: 12px;">This notification was sent from fakesol.com</p>
      `,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log(`Email sent for project: ${project.name}`);
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
}
