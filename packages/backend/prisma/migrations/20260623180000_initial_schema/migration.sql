-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `is_admin` BOOLEAN NOT NULL DEFAULT false,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Europe/Madrid',
    `language_preference` VARCHAR(191) NULL DEFAULT 'en',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `date_of_birth` DATE NULL,
    `phone_number` VARCHAR(50) NULL,
    `about_me` TEXT NULL,
    `spanish_level` VARCHAR(50) NULL,
    `preferred_class_types` TEXT NULL,
    `learning_goals` TEXT NULL,
    `availability_notes` TEXT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_slots` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `slot_type` ENUM('INDIVIDUAL', 'GROUP') NOT NULL DEFAULT 'INDIVIDUAL',
    `max_participants` INTEGER NOT NULL DEFAULT 1,
    `current_participants` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('AVAILABLE', 'FULLY_BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `meet_link` VARCHAR(191) NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `recurring_pattern_id` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `availability_slots_professor_id_idx`(`professor_id`),
    INDEX `availability_slots_start_time_idx`(`start_time`),
    INDEX `availability_slots_recurring_pattern_id_idx`(`recurring_pattern_id`),
    INDEX `availability_slots_professor_id_is_private_start_time_idx`(`professor_id`, `is_private`, `start_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `slot_allowed_students` (
    `id` VARCHAR(191) NOT NULL,
    `slot_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `slot_allowed_students_student_id_idx`(`student_id`),
    UNIQUE INDEX `slot_allowed_students_slot_id_student_id_key`(`slot_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_patterns` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `slot_type` ENUM('INDIVIDUAL', 'GROUP') NOT NULL DEFAULT 'INDIVIDUAL',
    `max_participants` INTEGER NOT NULL DEFAULT 1,
    `days_of_week` VARCHAR(191) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `recurring_patterns_professor_id_idx`(`professor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recurring_pattern_allowed_students` (
    `id` VARCHAR(191) NOT NULL,
    `recurring_pattern_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `recurring_pattern_allowed_students_student_id_idx`(`student_id`),
    UNIQUE INDEX `recurring_pattern_allowed_students_recurring_pattern_id_stud_key`(`recurring_pattern_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `slot_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `status` ENUM('CONFIRMED', 'CANCELLED_BY_STUDENT', 'CANCELLED_BY_PROFESSOR', 'COMPLETED', 'NO_SHOW', 'PENDING_CONFIRMATION', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    `booked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cancelled_at` DATETIME(3) NULL,
    `cancel_reason` VARCHAR(191) NULL,
    `confirmed_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `confirmation_token` TEXT NULL,
    `confirmation_expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `bookings_student_id_idx`(`student_id`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_confirmation_expires_at_idx`(`confirmation_expires_at`),
    UNIQUE INDEX `bookings_slot_id_student_id_key`(`slot_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_notes` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_notes_professor_id_student_id_idx`(`professor_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_notes` (
    `id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `agenda_notes` TEXT NULL,
    `session_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `meeting_notes_booking_id_key`(`booking_id`),
    INDEX `meeting_notes_professor_id_booking_id_idx`(`professor_id`, `booking_id`),
    INDEX `meeting_notes_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` VARCHAR(191) NOT NULL,
    `email_type` VARCHAR(191) NOT NULL,
    `from_address` VARCHAR(191) NOT NULL,
    `to_address` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `html_content` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'sent',
    `error` TEXT NULL,
    `metadata` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_logs_created_at_idx`(`created_at`),
    INDEX `email_logs_to_address_idx`(`to_address`),
    INDEX `email_logs_email_type_idx`(`email_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `used_confirmation_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `jti` VARCHAR(191) NOT NULL,
    `used_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `booking_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `used_confirmation_tokens_jti_key`(`jti`),
    INDEX `used_confirmation_tokens_jti_idx`(`jti`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_pricing` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `price_rsd` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `student_pricing_professor_id_idx`(`professor_id`),
    UNIQUE INDEX `student_pricing_professor_id_student_id_key`(`professor_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professor_daily_stats` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `classes_completed` INTEGER NOT NULL DEFAULT 0,
    `total_earnings_rsd` INTEGER NOT NULL DEFAULT 0,
    `unique_students` INTEGER NOT NULL DEFAULT 0,
    `cancelled_classes` INTEGER NOT NULL DEFAULT 0,
    `no_show_classes` INTEGER NOT NULL DEFAULT 0,
    `average_rating` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `professor_daily_stats_professor_id_date_idx`(`professor_id`, `date`),
    UNIQUE INDEX `professor_daily_stats_professor_id_date_key`(`professor_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `professor_monthly_stats` (
    `id` VARCHAR(191) NOT NULL,
    `professor_id` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `classes_completed` INTEGER NOT NULL DEFAULT 0,
    `total_earnings_rsd` INTEGER NOT NULL DEFAULT 0,
    `unique_students` INTEGER NOT NULL DEFAULT 0,
    `retention_rate` DOUBLE NULL,
    `average_rating` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `professor_monthly_stats_professor_id_year_month_idx`(`professor_id`, `year`, `month`),
    UNIQUE INDEX `professor_monthly_stats_professor_id_year_month_key`(`professor_id`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_engagement_stats` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `total_classes_booked` INTEGER NOT NULL DEFAULT 0,
    `total_classes_attended` INTEGER NOT NULL DEFAULT 0,
    `total_classes_cancelled` INTEGER NOT NULL DEFAULT 0,
    `no_show_count` INTEGER NOT NULL DEFAULT 0,
    `last_booking_date` DATETIME(3) NULL,
    `average_rating_given` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_engagement_stats_student_id_key`(`student_id`),
    INDEX `student_engagement_stats_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_daily_stats` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `total_bookings` INTEGER NOT NULL DEFAULT 0,
    `completed_bookings` INTEGER NOT NULL DEFAULT 0,
    `cancelled_bookings` INTEGER NOT NULL DEFAULT 0,
    `active_students` INTEGER NOT NULL DEFAULT 0,
    `active_professors` INTEGER NOT NULL DEFAULT 0,
    `new_registrations` INTEGER NOT NULL DEFAULT 0,
    `total_revenue_rsd` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_daily_stats_date_key`(`date`),
    INDEX `platform_daily_stats_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referrals` (
    `id` VARCHAR(191) NOT NULL,
    `referrer_id` VARCHAR(191) NOT NULL,
    `referred_id` VARCHAR(191) NOT NULL,
    `referral_code` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reward_granted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `referrals_referrer_id_idx`(`referrer_id`),
    INDEX `referrals_referred_id_idx`(`referred_id`),
    INDEX `referrals_referral_code_idx`(`referral_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ratings` (
    `id` VARCHAR(191) NOT NULL,
    `rater_id` VARCHAR(191) NOT NULL,
    `ratee_id` VARCHAR(191) NOT NULL,
    `booking_id` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `is_anonymous` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ratings_rater_id_idx`(`rater_id`),
    INDEX `ratings_ratee_id_idx`(`ratee_id`),
    INDEX `ratings_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `availability_slots` ADD CONSTRAINT `availability_slots_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_slots` ADD CONSTRAINT `availability_slots_recurring_pattern_id_fkey` FOREIGN KEY (`recurring_pattern_id`) REFERENCES `recurring_patterns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `slot_allowed_students` ADD CONSTRAINT `slot_allowed_students_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `availability_slots`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `slot_allowed_students` ADD CONSTRAINT `slot_allowed_students_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_patterns` ADD CONSTRAINT `recurring_patterns_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_pattern_allowed_students` ADD CONSTRAINT `recurring_pattern_allowed_students_recurring_pattern_id_fkey` FOREIGN KEY (`recurring_pattern_id`) REFERENCES `recurring_patterns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recurring_pattern_allowed_students` ADD CONSTRAINT `recurring_pattern_allowed_students_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_slot_id_fkey` FOREIGN KEY (`slot_id`) REFERENCES `availability_slots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_notes` ADD CONSTRAINT `student_notes_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_notes` ADD CONSTRAINT `student_notes_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_notes` ADD CONSTRAINT `meeting_notes_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_notes` ADD CONSTRAINT `meeting_notes_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_pricing` ADD CONSTRAINT `student_pricing_professor_id_fkey` FOREIGN KEY (`professor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referrer_id_fkey` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_referred_id_fkey` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_rater_id_fkey` FOREIGN KEY (`rater_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_ratee_id_fkey` FOREIGN KEY (`ratee_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

