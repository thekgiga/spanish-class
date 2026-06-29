CREATE TABLE `session_feedback` (
  `id`                     VARCHAR(191) NOT NULL,
  `booking_id`             VARCHAR(191) NOT NULL,
  `student_id`             VARCHAR(191) NOT NULL,
  `professor_id`           VARCHAR(191) NOT NULL,
  `rating`                 INTEGER NOT NULL,
  `what_was_good`          TEXT NULL,
  `what_could_be_improved` TEXT NULL,
  `created_at`             DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `session_feedback_booking_id_key`(`booking_id`),
  INDEX `session_feedback_professor_id_idx`(`professor_id`),
  INDEX `session_feedback_student_id_idx`(`student_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `session_feedback`
  ADD CONSTRAINT `session_feedback_booking_id_fkey`  FOREIGN KEY (`booking_id`)   REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `session_feedback_student_id_fkey`  FOREIGN KEY (`student_id`)   REFERENCES `users`(`id`)    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `session_feedback_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`)   ON DELETE RESTRICT ON UPDATE CASCADE;
