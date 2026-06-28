-- Drop the ratings table
DROP TABLE IF EXISTS `ratings`;

-- Remove average_rating_given column from student_engagement_stats
ALTER TABLE `student_engagement_stats` DROP COLUMN IF EXISTS `average_rating_given`;
