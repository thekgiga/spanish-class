import { Resend } from 'resend';
import type { AvailabilitySlot, UserPublic } from '@spanish-class/shared';
import { generateBookingIcs, generateCancellationIcs } from './ics.js';
import { prisma } from '../lib/prisma.js';
import { getMeetingProvider } from './meeting-provider.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'Spanish Class <noreply@spanishclass.com>';
const PROFESSOR_EMAIL = process.env.PROFESSOR_EMAIL || 'professor@spanishclass.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Helper function to log emails
async function logEmail(params: {
  emailType: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  htmlContent: string;
  status: 'sent' | 'failed';
  error?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        emailType: params.emailType,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        subject: params.subject,
        htmlContent: params.htmlContent,
        status: params.status,
        error: params.error,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

// Simple booking confirmation for professor direct booking
interface SimpleBookingConfirmationData {
  studentEmail: string;
  studentName: string;
  professorName: string;
  slotTitle: string;
  startTime: Date;
  endTime: Date;
  meetLink?: string | null;
}

export async function sendBookingConfirmation(data: SimpleBookingConfirmationData): Promise<void> {
  const { studentEmail, studentName, professorName, slotTitle, startTime, endTime, meetLink } = data;

  const duration = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000);
  const dateStr = formatDateTime(startTime);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1f36 0%, #2d3748 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
        .meet-link { background: #4285f4; color: white; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🗓️</div>
          <h1>You've Been Scheduled!</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName.split(' ')[0]},</p>
          <p>${professorName} has scheduled a Spanish class for you! Here are the details:</p>

          <div class="details">
            <p><strong>Session:</strong> ${slotTitle}</p>
            <p><strong>Date & Time:</strong> ${dateStr}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Professor:</strong> ${professorName}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            ${meetLink ? `<a href="${meetLink}" class="button meet-link">Join Video Class</a>` : ''}
            <a href="${FRONTEND_URL}/dashboard/bookings" class="button">View My Bookings</a>
          </div>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
          <p>If you need to cancel, please do so at least 24 hours in advance.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `🗓️ Class Scheduled: ${slotTitle} - ${dateStr}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: studentEmail,
      subject,
      html,
    });

    if (error) {
      await logEmail({
        emailType: 'booking_confirmation_simple',
        fromAddress: EMAIL_FROM,
        toAddress: studentEmail,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { studentName, professorName, slotTitle, startTime: startTime.toISOString() },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'booking_confirmation_simple',
      fromAddress: EMAIL_FROM,
      toAddress: studentEmail,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { studentName, professorName, slotTitle, startTime: startTime.toISOString(), resendId: data?.id },
    });
  } catch (err) {
    // Only log if not already logged above (i.e., not a Resend API error)
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'booking_confirmation_simple',
        fromAddress: EMAIL_FROM,
        toAddress: studentEmail,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { studentName, professorName, slotTitle, startTime: startTime.toISOString() },
      });
    }
    throw err;
  }
}

function formatDateTime(date: Date, timezone: string = 'Europe/Madrid'): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short',
  }).format(new Date(date));
}

interface BookingEmailData {
  slot: AvailabilitySlot;
  professor: UserPublic;
  student: UserPublic;
}

export async function sendBookingConfirmationToStudent(data: BookingEmailData): Promise<void> {
  const { slot, professor, student } = data;

  // Get meeting URL from Jitsi
  let meetingUrl: string | null = null;
  if (slot.meetingRoomName) {
    const provider = getMeetingProvider();
    meetingUrl = provider.getJoinUrl(slot.meetingRoomName, `${student.firstName} ${student.lastName}`);
  }

  const icsContent = await generateBookingIcs({
    slot,
    professor,
    student,
    meetLink: meetingUrl,
  });

  const icsBuffer = Buffer.from(icsContent, 'utf-8');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1f36 0%, #2d3748 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details-row { display: flex; margin-bottom: 10px; }
        .label { font-weight: 600; color: #4a5568; min-width: 100px; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
        .meet-link { background: #4285f4; color: white; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">🎉</div>
          <h1>Booking Confirmed!</h1>
        </div>
        <div class="content">
          <p>Hi ${student.firstName},</p>
          <p>Your Spanish class has been successfully booked! Here are the details:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Session:</span>
              <span>${slot.title || 'Spanish Class'}</span>
            </div>
            <div class="details-row">
              <span class="label">Date & Time:</span>
              <span>${formatDateTime(slot.startTime, student.timezone)}</span>
            </div>
            <div class="details-row">
              <span class="label">Duration:</span>
              <span>${Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000)} minutes</span>
            </div>
            <div class="details-row">
              <span class="label">Professor:</span>
              <span>${professor.firstName} ${professor.lastName}</span>
            </div>
            <div class="details-row">
              <span class="label">Type:</span>
              <span>${slot.slotType === 'GROUP' ? 'Group Session' : 'Individual Session'}</span>
            </div>
          </div>

          ${slot.description ? `<p><strong>Description:</strong> ${slot.description}</p>` : ''}

          <div style="text-align: center; margin-top: 30px;">
            ${meetingUrl ? `<a href="${meetingUrl}" class="button meet-link">Join Video Class</a>` : ''}
            <a href="${FRONTEND_URL}/dashboard/bookings" class="button">View My Bookings</a>
          </div>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            A calendar invitation (.ics file) is attached to this email. Add it to your calendar to receive reminders.
          </p>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
          <p>If you need to cancel, please do so at least 24 hours in advance.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `✅ Booking Confirmed: ${slot.title || 'Spanish Class'} - ${formatDateTime(slot.startTime, student.timezone)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: student.email,
      subject,
      html,
      attachments: [
        {
          filename: 'spanish-class.ics',
          content: icsBuffer,
        },
      ],
    });

    if (error) {
      await logEmail({
        emailType: 'booking_confirmation_student',
        fromAddress: EMAIL_FROM,
        toAddress: student.email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'booking_confirmation_student',
      fromAddress: EMAIL_FROM,
      toAddress: student.email,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id, resendId: data?.id },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'booking_confirmation_student',
        fromAddress: EMAIL_FROM,
        toAddress: student.email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id },
      });
    }
    throw err;
  }
}

export async function sendBookingNotificationToProfessor(data: BookingEmailData): Promise<void> {
  const { slot, professor, student } = data;

  // Get meeting URL from Jitsi
  let meetingUrl: string | null = null;
  if (slot.meetingRoomName) {
    const provider = getMeetingProvider();
    meetingUrl = provider.getJoinUrl(slot.meetingRoomName, `${professor.firstName} ${professor.lastName}`);
  }

  const icsContent = await generateBookingIcs({
    slot,
    professor,
    student,
    meetLink: meetingUrl,
  });

  const icsBuffer = Buffer.from(icsContent, 'utf-8');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1f36 0%, #2d3748 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details-row { display: flex; margin-bottom: 10px; }
        .label { font-weight: 600; color: #4a5568; min-width: 100px; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">📚</div>
          <h1>New Booking!</h1>
        </div>
        <div class="content">
          <p>Hi ${professor.firstName},</p>
          <p>A student has booked a session with you. Here are the details:</p>

          <div class="details">
            <div class="details-row">
              <span class="label">Student:</span>
              <span>${student.firstName} ${student.lastName}</span>
            </div>
            <div class="details-row">
              <span class="label">Email:</span>
              <span>${student.email}</span>
            </div>
            <div class="details-row">
              <span class="label">Session:</span>
              <span>${slot.title || 'Spanish Class'}</span>
            </div>
            <div class="details-row">
              <span class="label">Date & Time:</span>
              <span>${formatDateTime(slot.startTime, professor.timezone)}</span>
            </div>
            <div class="details-row">
              <span class="label">Participants:</span>
              <span>${slot.currentParticipants + 1}/${slot.maxParticipants}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${FRONTEND_URL}/admin/students/${student.id}" class="button">View Student Profile</a>
          </div>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `📚 New Booking: ${student.firstName} ${student.lastName} - ${formatDateTime(slot.startTime, professor.timezone)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: PROFESSOR_EMAIL,
      subject,
      html,
      attachments: [
        {
          filename: 'spanish-class.ics',
          content: icsBuffer,
        },
      ],
    });

    if (error) {
      await logEmail({
        emailType: 'booking_notification_professor',
        fromAddress: EMAIL_FROM,
        toAddress: PROFESSOR_EMAIL,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'booking_notification_professor',
      fromAddress: EMAIL_FROM,
      toAddress: PROFESSOR_EMAIL,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id, resendId: data?.id },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'booking_notification_professor',
        fromAddress: EMAIL_FROM,
        toAddress: PROFESSOR_EMAIL,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id },
      });
    }
    throw err;
  }
}

export async function sendCancellationToStudent(
  data: BookingEmailData & { reason?: string; cancelledBy: 'student' | 'professor' }
): Promise<void> {
  const { slot, professor, student, reason, cancelledBy } = data;

  const icsContent = await generateCancellationIcs({
    slot,
    professor,
    student,
  });

  const icsBuffer = Buffer.from(icsContent, 'utf-8');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e53e3e; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .details { background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7d7; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">❌</div>
          <h1>Session Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${student.firstName},</p>
          <p>${cancelledBy === 'student' ? 'Your booking has been cancelled as requested.' : 'We regret to inform you that the following session has been cancelled by the professor.'}</p>

          <div class="details">
            <p><strong>Session:</strong> ${slot.title || 'Spanish Class'}</p>
            <p><strong>Date & Time:</strong> ${formatDateTime(slot.startTime, student.timezone)}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${FRONTEND_URL}/dashboard/book" class="button">Book Another Session</a>
          </div>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `❌ Session Cancelled: ${slot.title || 'Spanish Class'} - ${formatDateTime(slot.startTime, student.timezone)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: student.email,
      subject,
      html,
      attachments: [
        {
          filename: 'cancellation.ics',
          content: icsBuffer,
        },
      ],
    });

    if (error) {
      await logEmail({
        emailType: 'cancellation_student',
        fromAddress: EMAIL_FROM,
        toAddress: student.email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { studentId: student.id, slotId: slot.id, cancelledBy, reason },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'cancellation_student',
      fromAddress: EMAIL_FROM,
      toAddress: student.email,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { studentId: student.id, slotId: slot.id, cancelledBy, reason, resendId: data?.id },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'cancellation_student',
        fromAddress: EMAIL_FROM,
        toAddress: student.email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { studentId: student.id, slotId: slot.id, cancelledBy, reason },
      });
    }
    throw err;
  }
}

export async function sendCancellationToProfessor(
  data: BookingEmailData & { reason?: string }
): Promise<void> {
  const { slot, professor, student, reason } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e53e3e; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .details { background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7d7; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">❌</div>
          <h1>Booking Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${professor.firstName},</p>
          <p>A student has cancelled their booking:</p>

          <div class="details">
            <p><strong>Student:</strong> ${student.firstName} ${student.lastName}</p>
            <p><strong>Session:</strong> ${slot.title || 'Spanish Class'}</p>
            <p><strong>Date & Time:</strong> ${formatDateTime(slot.startTime, professor.timezone)}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          </div>

          <p>The slot is now available for other students to book.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${FRONTEND_URL}/admin/calendar" class="button">View Calendar</a>
          </div>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `❌ Booking Cancelled: ${student.firstName} ${student.lastName} - ${formatDateTime(slot.startTime, professor.timezone)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: PROFESSOR_EMAIL,
      subject,
      html,
    });

    if (error) {
      await logEmail({
        emailType: 'cancellation_professor',
        fromAddress: EMAIL_FROM,
        toAddress: PROFESSOR_EMAIL,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id, reason },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'cancellation_professor',
      fromAddress: EMAIL_FROM,
      toAddress: PROFESSOR_EMAIL,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id, reason, resendId: data?.id },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'cancellation_professor',
        fromAddress: EMAIL_FROM,
        toAddress: PROFESSOR_EMAIL,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { studentId: student.id, slotId: slot.id, professorId: professor.id, reason },
      });
    }
    throw err;
  }
}

// Email verification
interface VerificationEmailData {
  email: string;
  firstName: string;
  verificationToken: string;
}

export async function sendVerificationEmail(data: VerificationEmailData): Promise<void> {
  const { email, firstName, verificationToken } = data;

  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1f36; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1f36 0%, #2d3748 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 14px; color: #718096; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
        .button { display: inline-block; background: #f5a623; color: #1a1f36; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .warning { background: #fffbeb; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
        h1 { margin: 0; font-size: 24px; }
        .emoji { font-size: 32px; margin-bottom: 10px; }
        .link-text { word-break: break-all; font-size: 12px; color: #718096; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji">✉️</div>
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Welcome to Spanish Class! Please verify your email address to activate your account and start booking classes.</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <div class="warning">
            <strong>Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with Spanish Class, you can safely ignore this email.
          </div>

          <p class="link-text">
            If the button doesn't work, copy and paste this link into your browser:<br>
            ${verificationUrl}
          </p>
        </div>
        <div class="footer">
          <p>Spanish Class Platform</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = '✉️ Verify your email - Spanish Class';

  try {
    const { data: resendData, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject,
      html,
    });

    if (error) {
      await logEmail({
        emailType: 'email_verification',
        fromAddress: EMAIL_FROM,
        toAddress: email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: error.message,
        metadata: { firstName },
      });
      throw new Error(error.message);
    }

    await logEmail({
      emailType: 'email_verification',
      fromAddress: EMAIL_FROM,
      toAddress: email,
      subject,
      htmlContent: html,
      status: 'sent',
      metadata: { firstName, resendId: resendData?.id },
    });
  } catch (err) {
    if (!(err instanceof Error && err.message.includes('domain'))) {
      await logEmail({
        emailType: 'email_verification',
        fromAddress: EMAIL_FROM,
        toAddress: email,
        subject,
        htmlContent: html,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        metadata: { firstName },
      });
    }
    throw err;
  }
}
