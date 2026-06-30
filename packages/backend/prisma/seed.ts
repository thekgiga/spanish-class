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

  // Second student — needed for concurrent-booking race test (P0-TEST-001)
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      passwordHash: studentPassword,
      firstName: 'Ana',
      lastName: 'Smith',
      isAdmin: false,
      timezone: 'Europe/London',
    },
  });
  console.log('Created second student user:', student2.email);

  // Assign both students to the professor so they can see slots
  await prisma.professorStudent.upsert({
    where: { studentId: student.id },
    update: {},
    create: { professorId: admin.id, studentId: student.id },
  });
  await prisma.professorStudent.upsert({
    where: { studentId: student2.id },
    update: {},
    create: { professorId: admin.id, studentId: student2.id },
  });
  console.log('Assigned both students to professor');

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

  // ── Deterministic booking fixtures ──────────────────────────────────────
  // These unlock the Phase 0 E2E test.fixme placeholders in
  // packages/frontend/tests/e2e/baseline/*.spec.ts.

  // Find the first available slot for the confirmed booking
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const confirmedSlot = await prisma.availabilitySlot.findFirst({
    where: { professorId: admin.id, status: 'AVAILABLE', startTime: { gte: tomorrow } },
    orderBy: { startTime: 'asc' },
  });

  if (confirmedSlot) {
    // Add a meet link to the confirmed slot so meeting-access tests can verify it
    await prisma.availabilitySlot.update({
      where: { id: confirmedSlot.id },
      data: { meetLink: 'https://meet.google.com/seed-confirmed-meeting' },
    });
    await prisma.booking.upsert({
      where: { id: 'seed-booking-confirmed' },
      update: {},
      create: {
        id: 'seed-booking-confirmed',
        slotId: confirmedSlot.id,
        studentId: student.id,
        status: 'CONFIRMED',
      },
    });
    console.log('Created confirmed booking fixture');
  }

  // Pending booking: use a different upcoming slot
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(10, 0, 0, 0);

  const pendingSlot = await prisma.availabilitySlot.findFirst({
    where: {
      professorId: admin.id,
      status: 'AVAILABLE',
      startTime: { gte: dayAfterTomorrow },
      id: { not: confirmedSlot?.id ?? '' },
    },
    orderBy: { startTime: 'asc' },
  });

  if (pendingSlot) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 h from now
    await prisma.booking.upsert({
      where: { id: 'seed-booking-pending' },
      update: {},
      create: {
        id: 'seed-booking-pending',
        slotId: pendingSlot.id,
        studentId: student.id,
        status: 'PENDING_CONFIRMATION',
        confirmationExpiresAt: expiresAt,
      },
    });
    console.log('Created pending booking fixture');
  }

  // In-app notification for the pending booking
  await prisma.notification.upsert({
    where: { id: 'seed-notification-pending' },
    update: {},
    create: {
      id: 'seed-notification-pending',
      userId: admin.id,
      type: 'booking_request',
      title: 'New booking request',
      body: 'John Doe has requested a lesson.',
    },
  });
  console.log('Created notification fixture');

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