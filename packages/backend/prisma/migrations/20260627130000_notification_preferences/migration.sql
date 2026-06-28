CREATE TABLE `notification_preferences` (
  `id`         VARCHAR(191) NOT NULL,
  `user_id`    VARCHAR(191) NOT NULL,
  `type`       VARCHAR(50)  NOT NULL,
  `enabled`    BOOLEAN      NOT NULL DEFAULT true,
  `created_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3)  NOT NULL,
  UNIQUE INDEX `notification_preferences_user_id_type_key`(`user_id`, `type`),
  INDEX `notification_preferences_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
