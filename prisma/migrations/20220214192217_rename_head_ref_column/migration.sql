/*
  Warnings:

  - You are about to drop the column `head_ref` on the `qa__pull_request_commit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[head_commit_id]` on the table `qa__pull_request_commit` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `qa__pull_request_commit` DROP FOREIGN KEY `qa__pull_request_commit_ibfk_3`;

-- AlterTable
ALTER TABLE `qa__pull_request_commit` DROP COLUMN `head_ref`,
    ADD COLUMN `head_commit_id` VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX `head_commit_id` ON `qa__pull_request_commit`(`head_commit_id`);

-- AddForeignKey
ALTER TABLE `qa__pull_request_commit` ADD CONSTRAINT `qa__pull_request_commit_ibfk_3` FOREIGN KEY (`head_commit_id`) REFERENCES `qa__commits`(`commit_event_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
