import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { sendAnonymousAdminEmail, sendNamedAdminEmail, sendEmployeeConfirmationEmail } from '../services/emailService';

const router = Router();

router.post('/anonymous', async (req: Request, res: Response): Promise<any> => {
  try {
    const { feedbacks } = req.body;
    if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      return res.status(400).json({ detail: 'At least one feedback entry is required.' });
    }

    const createdIds: number[] = [];

    // Use a transaction
    await prisma.$transaction(async (tx) => {
      for (const entry of feedbacks) {
        if (!entry.category?.trim() || !entry.text?.trim()) {
          throw new Error('Validation: Category and feedback text are required for all entries.');
        }

        const fb = await tx.feedback.create({
          data: {
            category: entry.category.trim(),
            text: entry.text.trim(),
            is_anonymous: true,
            employee_id: null,
          },
        });
        createdIds.push(fb.id);

        // Add to FMS Integration Outbox
        await tx.fmsIntegrationOutbox.create({
          data: {
            feedback_id: fb.id,
            status: 'PENDING',
          },
        });
      }
    });

    // Send admin notification (non-blocking)
    sendAnonymousAdminEmail(feedbacks.length).catch(err => console.warn('Email failed:', err));

    return res.status(201).json({
      message: 'Feedback submitted successfully. For urgent matters contact wehearyou@damcogroup.com',
      feedback_ids: createdIds,
      count: createdIds.length,
    });
  } catch (error: any) {
    if (error.message.startsWith('Validation:')) {
      return res.status(422).json({ detail: error.message.replace('Validation: ', '') });
    }
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

router.post('/named', async (req: Request, res: Response): Promise<any> => {
  try {
    const { employee_details, feedbacks } = req.body;
    if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      return res.status(400).json({ detail: 'At least one feedback entry is required.' });
    }

    const createdIds: number[] = [];
    let employeeName = '';
    let employeeEmail = '';

    await prisma.$transaction(async (tx) => {
      const emailLower = employee_details.email.toLowerCase().trim();
      let employee = await tx.employee.upsert({
        where: { email: emailLower },
        update: {
          name: employee_details.name,
          employee_code: employee_details.employee_code,
          designation: employee_details.designation,
          division: employee_details.division,
          joining_date: employee_details.joining_date,
          feedback_source: employee_details.feedback_source,
        },
        create: {
          email: emailLower,
          name: employee_details.name,
          employee_code: employee_details.employee_code,
          designation: employee_details.designation,
          division: employee_details.division,
          joining_date: employee_details.joining_date,
          feedback_source: employee_details.feedback_source,
        }
      });
      
      employeeName = employee.name;
      employeeEmail = employee.email;

      for (const entry of feedbacks) {
        if (!entry.category?.trim() || !entry.text?.trim()) {
          throw new Error('Validation: Category and feedback text are required for all entries.');
        }

        const fb = await tx.feedback.create({
          data: {
            category: entry.category.trim(),
            text: entry.text.trim(),
            is_anonymous: false,
            employee_id: employee.id,
          },
        });
        createdIds.push(fb.id);

        await tx.fmsIntegrationOutbox.create({
          data: {
            feedback_id: fb.id,
            status: 'PENDING',
          },
        });
      }
    });

    sendNamedAdminEmail(employeeName, feedbacks.length).catch(err => console.warn('Email failed:', err));
    sendEmployeeConfirmationEmail(employeeEmail, employeeName).catch(err => console.warn('Email failed:', err));

    return res.status(201).json({
      message: 'Feedback submitted successfully. For urgent matters contact wehearyou@damcogroup.com',
      feedback_ids: createdIds,
      count: createdIds.length,
    });
  } catch (error: any) {
    if (error.message.startsWith('Validation:')) {
      return res.status(422).json({ detail: error.message.replace('Validation: ', '') });
    }
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const feedbacks = await prisma.feedback.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { employee: true },
    });

    return res.json(feedbacks);
  } catch (error) {
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
