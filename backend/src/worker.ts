import { prisma } from './db';

const FMS_BASE_URL = process.env.FMS_BASE_URL || 'http://localhost:3001';
const FMS_API_TOKEN = process.env.FMS_API_TOKEN || '';

export async function processOutbox() {
  try {
    const events = await prisma.fmsIntegrationOutbox.findMany({
      where: {
        status: { in: ['PENDING', 'FAILED'] },
        retry_count: { lt: 5 },
      },
      take: 10,
      include: {
        feedback: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (events.length === 0) return;

    for (const event of events) {
      try {
        await prisma.fmsIntegrationOutbox.update({
          where: { id: event.id },
          data: { status: 'PROCESSING', last_attempt_at: new Date() },
        });

        const feedback = event.feedback;
        let reporterPayload = {
          is_anonymous: true,
          email: 'anonymous-reporter@voicebox.internal',
          name: 'Anonymous Voicebox User',
        };

        if (!feedback.is_anonymous && feedback.employee) {
          reporterPayload = {
            is_anonymous: false,
            email: feedback.employee.email,
            name: feedback.employee.name,
          };
        }

        const payload = {
          title: `Voicebox Feedback - ${feedback.category}`,
          description: feedback.text,
          feedbackSource: 'VoiceBox',
          category: feedback.category,
          isAnonymous: feedback.is_anonymous,
          empFullName: reporterPayload.name,
          empEmail: reporterPayload.email,
          empCode: feedback.employee ? feedback.employee.employee_code : undefined,
          empDepartment: feedback.employee ? feedback.employee.division : undefined,
          empDesignation: feedback.employee ? feedback.employee.designation : undefined,
          empJoiningDate: feedback.employee ? feedback.employee.joining_date : undefined,
          external_ref_id: `VB-FEEDBACK-${feedback.id}`
        };

        const response = await fetch(`${FMS_BASE_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': FMS_API_TOKEN, // Static Service Token Header
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`FMS Error ${response.status}: ${errorText}`);
        }

        const responseData = await response.json();
        
        await prisma.fmsIntegrationOutbox.update({
          where: { id: event.id },
          data: {
            status: 'SYNCED',
            fms_ticket_id: String(responseData.id || responseData.ticket_id || 'UNKNOWN'),
            error_message: null,
          },
        });

        console.log(`Successfully synced feedback ${feedback.id} to FMS using static API Key.`);
      } catch (err: any) {
        console.error(`Failed to sync feedback ${event.feedback_id}:`, err.message);

        const newRetryCount = event.retry_count + 1;
        const newStatus = newRetryCount >= 5 ? 'DLQ' : 'FAILED';

        await prisma.fmsIntegrationOutbox.update({
          where: { id: event.id },
          data: {
            status: newStatus,
            retry_count: newRetryCount,
            error_message: err.message,
          },
        });
      }
    }
  } catch (err) {
    console.error('Error in outbox worker loop:', err);
  }
}

export function startOutboxWorker() {
  console.log('Starting FMS Integration Outbox Worker with Static API Key bypass...');
  setInterval(processOutbox, 10000);
}
