-- Sync previously added User profile columns/indexes into migration history
ALTER TABLE `User`
  ADD COLUMN IF NOT EXISTS `username` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `department` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `designation` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `language` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `bio` TEXT NULL;

-- Recreate unique indexes safely so migration can run on DBs with/without existing indexes
ALTER TABLE `User` DROP INDEX IF EXISTS `User_username_key`;
ALTER TABLE `User` ADD UNIQUE INDEX `User_username_key`(`username`);

ALTER TABLE `User` DROP INDEX IF EXISTS `User_phone_key`;
ALTER TABLE `User` ADD UNIQUE INDEX `User_phone_key`(`phone`);
