CREATE TABLE `professor_students` (
  `id` VARCHAR(191) NOT NULL,
  `professor_id` VARCHAR(191) NOT NULL,
  `student_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `professor_students_student_id_key`(`student_id`),
  INDEX `professor_students_professor_id_idx`(`professor_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `student_covers` (
  `id` VARCHAR(191) NOT NULL,
  `student_id` VARCHAR(191) NOT NULL,
  `cover_professor_id` VARCHAR(191) NOT NULL,
  `starts_at` DATETIME(3) NOT NULL,
  `ends_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `student_covers_student_id_idx`(`student_id`),
  INDEX `student_covers_cover_professor_id_idx`(`cover_professor_id`),
  INDEX `student_covers_starts_at_ends_at_idx`(`starts_at`, `ends_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `student_invitations` (
  `id` VARCHAR(191) NOT NULL,
  `professor_id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `accepted_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `student_invitations_token_hash_key`(`token_hash`),
  INDEX `student_invitations_professor_id_idx`(`professor_id`),
  INDEX `student_invitations_email_idx`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `professor_students`
  ADD CONSTRAINT `professor_students_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `professor_students_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `student_covers`
  ADD CONSTRAINT `student_covers_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_covers_cover_professor_id_fkey` FOREIGN KEY (`cover_professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `student_invitations`
  ADD CONSTRAINT `student_invitations_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
