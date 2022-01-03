/*
  Warnings:

  - The primary key for the `qa__pull_requests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[repo,pull_number]` on the table `qa__pull_requests` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pull_request_id` to the `qa__pull_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qa__pull_requests` DROP PRIMARY KEY,
    ADD COLUMN `pull_request_id` VARCHAR(255) NOT NULL,
    ADD PRIMARY KEY (`pull_request_id`);

-- CreateIndex
CREATE UNIQUE INDEX `qa__pull_requests_repo_pull_number_key` ON `qa__pull_requests`(`repo`, `pull_number`);
