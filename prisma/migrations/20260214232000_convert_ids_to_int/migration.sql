SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `User` ADD COLUMN `id_new` INT NULL FIRST;
ALTER TABLE `PasswordResetToken` ADD COLUMN `id_new` INT NULL FIRST;
ALTER TABLE `LifeCalculatorReport` ADD COLUMN `id_new` INT NULL FIRST;
ALTER TABLE `AyuMilanReport` ADD COLUMN `id_new` INT NULL FIRST;
ALTER TABLE `AyuMilanResponseChunk` ADD COLUMN `id_new` INT NULL FIRST;

SET @row := 0;
UPDATE `User` SET `id_new` = (@row := @row + 1) ORDER BY `createdAt`, `id`;
SET @row := 0;
UPDATE `PasswordResetToken` SET `id_new` = (@row := @row + 1) ORDER BY `createdAt`, `id`;
SET @row := 0;
UPDATE `LifeCalculatorReport` SET `id_new` = (@row := @row + 1) ORDER BY `createdAt`, `id`;
SET @row := 0;
UPDATE `AyuMilanReport` SET `id_new` = (@row := @row + 1) ORDER BY `createdAt`, `id`;
SET @row := 0;
UPDATE `AyuMilanResponseChunk` SET `id_new` = (@row := @row + 1) ORDER BY `createdAt`, `id`;

ALTER TABLE `Account` ADD COLUMN `userId_new` INT NULL;
ALTER TABLE `Session` ADD COLUMN `userId_new` INT NULL;
ALTER TABLE `PasswordResetToken` ADD COLUMN `userId_new` INT NULL;
ALTER TABLE `LifeCalculatorReport` ADD COLUMN `userId_new` INT NULL;
ALTER TABLE `AyuMilanReport` ADD COLUMN `userId_new` INT NULL;
ALTER TABLE `AyuMilanResponseChunk` ADD COLUMN `reportId_new` INT NULL;

UPDATE `Account` a JOIN `User` u ON a.`userId` = u.`id` SET a.`userId_new` = u.`id_new`;
UPDATE `Session` s JOIN `User` u ON s.`userId` = u.`id` SET s.`userId_new` = u.`id_new`;
UPDATE `PasswordResetToken` p JOIN `User` u ON p.`userId` = u.`id` SET p.`userId_new` = u.`id_new`;
UPDATE `LifeCalculatorReport` l JOIN `User` u ON l.`userId` = u.`id` SET l.`userId_new` = u.`id_new`;
UPDATE `AyuMilanReport` a JOIN `User` u ON a.`userId` = u.`id` SET a.`userId_new` = u.`id_new`;
UPDATE `AyuMilanResponseChunk` c JOIN `AyuMilanReport` r ON c.`reportId` = r.`id` SET c.`reportId_new` = r.`id_new`;

ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;
ALTER TABLE `Session` DROP FOREIGN KEY `Session_userId_fkey`;
ALTER TABLE `PasswordResetToken` DROP FOREIGN KEY `PasswordResetToken_userId_fkey`;
ALTER TABLE `LifeCalculatorReport` DROP FOREIGN KEY `LifeCalculatorReport_userId_fkey`;
ALTER TABLE `AyuMilanReport` DROP FOREIGN KEY `AyuMilanReport_userId_fkey`;
ALTER TABLE `AyuMilanResponseChunk` DROP FOREIGN KEY `AyuMilanResponseChunk_reportId_fkey`;

ALTER TABLE `User` DROP PRIMARY KEY;
ALTER TABLE `User` DROP COLUMN `id`;
ALTER TABLE `User` CHANGE COLUMN `id_new` `id` INT NOT NULL;
ALTER TABLE `User` ADD PRIMARY KEY (`id`);
ALTER TABLE `User` MODIFY `id` INT NOT NULL AUTO_INCREMENT;

ALTER TABLE `PasswordResetToken` DROP INDEX `PasswordResetToken_userId_idx`;
ALTER TABLE `PasswordResetToken` DROP PRIMARY KEY;
ALTER TABLE `PasswordResetToken` DROP COLUMN `id`;
ALTER TABLE `PasswordResetToken` CHANGE COLUMN `id_new` `id` INT NOT NULL;
ALTER TABLE `PasswordResetToken` ADD PRIMARY KEY (`id`);
ALTER TABLE `PasswordResetToken` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `PasswordResetToken` DROP COLUMN `userId`;
ALTER TABLE `PasswordResetToken` CHANGE COLUMN `userId_new` `userId` INT NOT NULL;
ALTER TABLE `PasswordResetToken` ADD INDEX `PasswordResetToken_userId_idx`(`userId`);

ALTER TABLE `LifeCalculatorReport` DROP INDEX `LifeCalculatorReport_userId_createdAt_idx`;
ALTER TABLE `LifeCalculatorReport` DROP PRIMARY KEY;
ALTER TABLE `LifeCalculatorReport` DROP COLUMN `id`;
ALTER TABLE `LifeCalculatorReport` CHANGE COLUMN `id_new` `id` INT NOT NULL;
ALTER TABLE `LifeCalculatorReport` ADD PRIMARY KEY (`id`);
ALTER TABLE `LifeCalculatorReport` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `LifeCalculatorReport` DROP COLUMN `userId`;
ALTER TABLE `LifeCalculatorReport` CHANGE COLUMN `userId_new` `userId` INT NOT NULL;
ALTER TABLE `LifeCalculatorReport` ADD INDEX `LifeCalculatorReport_userId_createdAt_idx`(`userId`,`createdAt`);

ALTER TABLE `AyuMilanReport` DROP INDEX `AyuMilanReport_userId_createdAt_idx`;
ALTER TABLE `AyuMilanReport` DROP PRIMARY KEY;
ALTER TABLE `AyuMilanReport` DROP COLUMN `id`;
ALTER TABLE `AyuMilanReport` CHANGE COLUMN `id_new` `id` INT NOT NULL;
ALTER TABLE `AyuMilanReport` ADD PRIMARY KEY (`id`);
ALTER TABLE `AyuMilanReport` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `AyuMilanReport` DROP COLUMN `userId`;
ALTER TABLE `AyuMilanReport` CHANGE COLUMN `userId_new` `userId` INT NOT NULL;
ALTER TABLE `AyuMilanReport` ADD INDEX `AyuMilanReport_userId_createdAt_idx`(`userId`,`createdAt`);

ALTER TABLE `AyuMilanResponseChunk` DROP INDEX `AyuMilanResponseChunk_reportId_chunkIndex_key`;
ALTER TABLE `AyuMilanResponseChunk` DROP INDEX `AyuMilanResponseChunk_reportId_idx`;
ALTER TABLE `AyuMilanResponseChunk` DROP PRIMARY KEY;
ALTER TABLE `AyuMilanResponseChunk` DROP COLUMN `id`;
ALTER TABLE `AyuMilanResponseChunk` CHANGE COLUMN `id_new` `id` INT NOT NULL;
ALTER TABLE `AyuMilanResponseChunk` ADD PRIMARY KEY (`id`);
ALTER TABLE `AyuMilanResponseChunk` MODIFY `id` INT NOT NULL AUTO_INCREMENT;
ALTER TABLE `AyuMilanResponseChunk` DROP COLUMN `reportId`;
ALTER TABLE `AyuMilanResponseChunk` CHANGE COLUMN `reportId_new` `reportId` INT NOT NULL;
ALTER TABLE `AyuMilanResponseChunk` ADD UNIQUE INDEX `AyuMilanResponseChunk_reportId_chunkIndex_key`(`reportId`, `chunkIndex`);
ALTER TABLE `AyuMilanResponseChunk` ADD INDEX `AyuMilanResponseChunk_reportId_idx`(`reportId`);

ALTER TABLE `Account` DROP INDEX `Account_userId_idx`;
ALTER TABLE `Account` DROP COLUMN `userId`;
ALTER TABLE `Account` CHANGE COLUMN `userId_new` `userId` INT NOT NULL;
ALTER TABLE `Account` ADD INDEX `Account_userId_idx`(`userId`);

ALTER TABLE `Session` DROP INDEX `Session_userId_idx`;
ALTER TABLE `Session` DROP COLUMN `userId`;
ALTER TABLE `Session` CHANGE COLUMN `userId_new` `userId` INT NOT NULL;
ALTER TABLE `Session` ADD INDEX `Session_userId_idx`(`userId`);

ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LifeCalculatorReport` ADD CONSTRAINT `LifeCalculatorReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AyuMilanReport` ADD CONSTRAINT `AyuMilanReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AyuMilanResponseChunk` ADD CONSTRAINT `AyuMilanResponseChunk_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `AyuMilanReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
