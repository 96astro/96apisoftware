CREATE TABLE `subscriptionplan` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `subscriptionplan_name_key`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `subscriptionplan` (`name`, `createdAt`, `updatedAt`)
VALUES ('Basic Plan', NOW(3), NOW(3));

ALTER TABLE `user`
ADD COLUMN `subscriptionPlanId` INTEGER NULL;

UPDATE `user`
SET `subscriptionPlanId` = 1
WHERE `subscriptionPlanId` IS NULL;

ALTER TABLE `user`
MODIFY `subscriptionPlanId` INTEGER NOT NULL;

ALTER TABLE `user`
ADD INDEX `user_subscriptionPlanId_idx`(`subscriptionPlanId`);

ALTER TABLE `user`
ADD CONSTRAINT `user_subscriptionPlanId_fkey`
FOREIGN KEY (`subscriptionPlanId`) REFERENCES `subscriptionplan`(`id`)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `user`
DROP COLUMN `plan`;