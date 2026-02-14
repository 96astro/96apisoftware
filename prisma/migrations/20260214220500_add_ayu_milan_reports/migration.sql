-- CreateTable
CREATE TABLE `AyuMilanReport` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `boyName` VARCHAR(191) NOT NULL,
    `boyBirthDate` DATETIME(3) NOT NULL,
    `boyBirthTime` VARCHAR(191) NOT NULL,
    `boyPlaceOfBirth` VARCHAR(191) NOT NULL,
    `boyLatitudeDeg` INTEGER NOT NULL,
    `boyLatitudeMin` INTEGER NOT NULL,
    `boyLatitudeDir` VARCHAR(1) NOT NULL,
    `boyLongitudeDeg` INTEGER NOT NULL,
    `boyLongitudeMin` INTEGER NOT NULL,
    `boyLongitudeDir` VARCHAR(1) NOT NULL,
    `boyTimezone` DOUBLE NOT NULL,
    `girlName` VARCHAR(191) NOT NULL,
    `girlBirthDate` DATETIME(3) NOT NULL,
    `girlBirthTime` VARCHAR(191) NOT NULL,
    `girlPlaceOfBirth` VARCHAR(191) NOT NULL,
    `girlLatitudeDeg` INTEGER NOT NULL,
    `girlLatitudeMin` INTEGER NOT NULL,
    `girlLatitudeDir` VARCHAR(1) NOT NULL,
    `girlLongitudeDeg` INTEGER NOT NULL,
    `girlLongitudeMin` INTEGER NOT NULL,
    `girlLongitudeDir` VARCHAR(1) NOT NULL,
    `girlTimezone` DOUBLE NOT NULL,
    `requestPayload` JSON NOT NULL,
    `responseJson` JSON NULL,
    `responseRaw` LONGTEXT NOT NULL,
    `apiJobId` VARCHAR(191) NULL,
    `apiStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AyuMilanReport_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AyuMilanReport` ADD CONSTRAINT `AyuMilanReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
