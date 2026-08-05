-- Add BLOCKED to SlotType enum
-- The DB column already has this value; this migration syncs Prisma schema with the DB state.
ALTER TABLE `availability_slots` MODIFY COLUMN `slot_type` ENUM('INDIVIDUAL', 'GROUP', 'BLOCKED') NOT NULL DEFAULT 'INDIVIDUAL';
