-- AlterTable
ALTER TABLE `qa__pull_requests` ADD COLUMN `dev_blocked` BOOLEAN DEFAULT false,
    ADD COLUMN `qa_stamped` BOOLEAN DEFAULT false;
