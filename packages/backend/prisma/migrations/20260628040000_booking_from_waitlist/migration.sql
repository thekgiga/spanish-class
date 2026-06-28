-- Add from_waitlist flag to bookings to track waitlist-promoted bookings (W1)
ALTER TABLE `bookings` ADD COLUMN `from_waitlist` BOOLEAN NOT NULL DEFAULT FALSE AFTER `status`;
