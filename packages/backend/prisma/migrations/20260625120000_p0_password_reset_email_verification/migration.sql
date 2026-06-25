-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verification_expires_at` DATETIME(3) NULL,
    ADD COLUMN `email_verification_token` VARCHAR(128) NULL,
    ADD COLUMN `is_email_verified` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
    INDEX `password_reset_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_email_verification_token_key` ON `users`(`email_verification_token`);

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: all existing users are considered verified so they aren't locked out
-- after this migration ships. Only NEW users registered after this migration
-- will go through the email verification flow.
UPDATE `users` SET `is_email_verified` = true WHERE `created_at` < NOW();
