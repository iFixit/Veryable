/*
  Warnings:

  - Added the required column `head_commit_id` to the `qa__pull_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qa__pull_requests` ADD COLUMN `head_commit_id` CHAR(255) NOT NULL;
