-- CreateTable
CREATE TABLE `LifeCalculatorResponseChunk` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `chunkIndex` INTEGER NOT NULL,
    `data` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LifeCalculatorResponseChunk_reportId_chunkIndex_key`(`reportId`, `chunkIndex`),
    INDEX `LifeCalculatorResponseChunk_reportId_idx`(`reportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LifeCalculatorResponseChunk` ADD CONSTRAINT `LifeCalculatorResponseChunk_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `LifeCalculatorReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
