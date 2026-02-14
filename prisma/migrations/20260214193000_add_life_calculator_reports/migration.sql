-- CreateTable
CREATE TABLE `LifeCalculatorReport` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `placeOfBirth` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `birthTime` VARCHAR(191) NOT NULL,
    `day` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `hour` INTEGER NOT NULL,
    `minute` INTEGER NOT NULL,
    `second` INTEGER NOT NULL,
    `longitudeDeg` INTEGER NOT NULL,
    `longitudeMin` INTEGER NOT NULL,
    `longitudeDir` VARCHAR(1) NOT NULL,
    `latitudeDeg` INTEGER NOT NULL,
    `latitudeMin` INTEGER NOT NULL,
    `latitudeDir` VARCHAR(1) NOT NULL,
    `timezone` DOUBLE NOT NULL,
    `chartStyle` VARCHAR(191) NOT NULL,
    `kpHoraryNumber` INTEGER NOT NULL,
    `requestPayload` JSON NOT NULL,
    `responseJson` JSON NOT NULL,
    `apiJobId` VARCHAR(191) NULL,
    `apiStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LifeCalculatorReport_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LifeCalculatorReport` ADD CONSTRAINT `LifeCalculatorReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
