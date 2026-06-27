ALTER TABLE `bookings`
  ADD COLUMN `reminder_sent_24h` DATETIME(3) NULL,
  ADD COLUMN `reminder_sent_1h` DATETIME(3) NULL;
