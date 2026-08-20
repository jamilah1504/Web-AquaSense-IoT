-- AlterTable
ALTER TABLE `user` ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `NotificationRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationConfig` (
    `id` VARCHAR(191) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `triggerOnWarning` BOOLEAN NOT NULL DEFAULT true,
    `triggerOnCritical` BOOLEAN NOT NULL DEFAULT true,
    `triggerOnSensorOffline` BOOLEAN NOT NULL DEFAULT false,
    `triggerOnDeviceOffline` BOOLEAN NOT NULL DEFAULT true,
    `cooldownMinutes` INTEGER NOT NULL DEFAULT 15,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
