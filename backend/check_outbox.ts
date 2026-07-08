import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.fmsIntegrationOutbox.findMany({
    orderBy: { created_at: 'desc' },
    take: 5,
  });
  
  console.log("Latest Outbox Events:");
  console.table(events);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
