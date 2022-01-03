/*
  Warnings:

  - Added the required column `author` to the `qa__pull_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qa__pull_requests` ADD COLUMN `author` VARCHAR(40) NOT NULL;
