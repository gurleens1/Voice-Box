import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'IT Infrastructure',
  'Workplace Relationships',
  'Work-life Balance',
  'Leave and Attendance',
  'Performance Management',
  'L&D',
  'R&R',
  'Admin & Facilities',
  'Organization Policies',
  'Top Management',
  'Finance',
  'Compensation & Benefits',
  'Recruitment',
  'Onboarding',
  'Internal Communication',
  'Diversity & Inclusion',
  'Health & Safety',
  'Employee Engagement',
  'Career Progression',
  'Mental Health & Wellbeing',
  'Manager Behavior',
  'Project/Work Alignment',
  'Social Impact',
  'N&B'
];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Categories seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
