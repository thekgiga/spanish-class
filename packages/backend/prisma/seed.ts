import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin/professor user
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'professor@spanishclass.com' },
    update: {},
    create: {
      email: 'professor@spanishclass.com',
      passwordHash: adminPassword,
      firstName: 'Maria',
      lastName: 'Garcia',
      isAdmin: true,
      timezone: 'Europe/Madrid',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create a test student
  const studentPassword = await bcrypt.hash('Student123!', 12);

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      isAdmin: false,
      timezone: 'America/New_York',
    },
  });

  console.log('Created student user:', student.email);

  // Create some sample availability slots for the next 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sampleSlots = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Morning slot (10:00 - 11:00)
    const morningStart = new Date(date);
    morningStart.setHours(10, 0, 0, 0);
    const morningEnd = new Date(date);
    morningEnd.setHours(11, 0, 0, 0);

    sampleSlots.push({
      professorId: admin.id,
      startTime: morningStart,
      endTime: morningEnd,
      slotType: 'INDIVIDUAL' as const,
      maxParticipants: 1,
      title: 'Conversation Practice',
      description: 'One-on-one conversation practice session focusing on real-world scenarios.',
    });

    // Afternoon slot (15:00 - 16:00) - Group class on weekdays
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      const afternoonStart = new Date(date);
      afternoonStart.setHours(15, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(16, 0, 0, 0);

      sampleSlots.push({
        professorId: admin.id,
        startTime: afternoonStart,
        endTime: afternoonEnd,
        slotType: 'GROUP' as const,
        maxParticipants: 5,
        title: 'Group Grammar Workshop',
        description: 'Interactive group session covering essential Spanish grammar concepts.',
      });
    }
  }

  // Create slots
  for (const slot of sampleSlots) {
    await prisma.availabilitySlot.create({
      data: slot,
    });
  }

  console.log(`Created ${sampleSlots.length} sample slots`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
