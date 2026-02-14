-- AlterTable
ALTER TABLE `LifeCalculatorReport`
  MODIFY `responseJson` JSON NULL,
  ADD COLUMN `responseRaw` LONGTEXT NULL;

UPDATE `LifeCalculatorReport` SET `responseRaw` = '' WHERE `responseRaw` IS NULL;

ALTER TABLE `LifeCalculatorReport`
  MODIFY `responseRaw` LONGTEXT NOT NULL;
