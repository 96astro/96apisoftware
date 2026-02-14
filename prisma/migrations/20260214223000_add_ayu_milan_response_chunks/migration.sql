-- CreateTable
CREATE TABLE `AyuMilanResponseChunk` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `chunkIndex` INTEGER NOT NULL,
    `data` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AyuMilanResponseChunk_reportId_chunkIndex_key`(`reportId`, `chunkIndex`),
    INDEX `AyuMilanResponseChunk_reportId_idx`(`reportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AyuMilanResponseChunk` ADD CONSTRAINT `AyuMilanResponseChunk_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `AyuMilanReport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
