-- Add professor response fields to session_feedback
ALTER TABLE `session_feedback`
  ADD COLUMN `professor_response` TEXT NULL AFTER `what_could_be_improved`,
  ADD COLUMN `responded_at` DATETIME(3) NULL AFTER `professor_response`;
