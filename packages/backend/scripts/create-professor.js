import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createProfessor() {
  try {
    const passwordHash = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        email: "professor@spanishclass.com",
        firstName: "Professor",
        lastName: "Demo",
        passwordHash: passwordHash,
        isAdmin: true,
        timezone: "Europe/Belgrade",
        languagePreference: "en",
      },
    });

    console.log("✅ Professor created successfully!");
    console.log("Email:", user.email);
    console.log("Password: password123");
    console.log("Is Admin:", user.isAdmin);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createProfessor();
