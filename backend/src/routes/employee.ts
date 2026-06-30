import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ detail: 'Email query parameter is required' });
    }

    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!employee) {
      return res.status(404).json({ detail: `No employee found with email: ${email}` });
    }

    return res.json(employee);
  } catch (error) {
    return res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
