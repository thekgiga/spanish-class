-- AlterTable: make bookingId optional so group-class session notes can be slot-scoped
ALTER TABLE `meeting_notes`
  MODIFY `booking_id` VARCHAR(191) NULL;

-- AddColumn: slot-level FK (always populated; bookingId can be null for group sessions)
ALTER TABLE `meeting_notes`
  ADD COLUMN `slot_id` VARCHAR(191) NULL,
  ADD COLUMN `homework_notes` TEXT NULL,
  ADD COLUMN `student_observation` TEXT NULL;

-- BackfillHint: slot_id from related booking for existing rows (best-effort)
UPDATE `meeting_notes` mn
  JOIN `bookings` b ON b.id = mn.booking_id
  SET mn.slot_id = b.slot_id
  WHERE mn.slot_id IS NULL AND mn.booking_id IS NOT NULL;

-- Index for slot-based lookup (session mode)
CREATE INDEX `meeting_notes_slot_id_idx` ON `meeting_notes`(`slot_id`);
