// IMPORTANT: Load environment config FIRST, before any other imports
import "../src/config/env.js";

import { beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";

beforeAll(async () => {
  // Ensure database connection is ready
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup and disconnect
  await prisma.$disconnect();
});
