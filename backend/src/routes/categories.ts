import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories.map(c => c.name));
  } catch (error) {
    res.status(500).json({ detail: 'Internal server error' });
  }
});

export default router;
