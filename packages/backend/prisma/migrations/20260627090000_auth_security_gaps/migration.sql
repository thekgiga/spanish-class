-- AlterTable: Add session management & security fields to users
ALTER TABLE `users`
  ADD COLUMN `token_version` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `known_ips` TEXT NULL,
  ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- CreateTable: email_change_requests
CREATE TABLE `email_change_requests` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `new_email` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_change_requests_token_hash_key`(`token_hash`),
    INDEX `email_change_requests_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_change_requests` ADD CONSTRAINT `email_change_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
