/*
  Warnings:

  - You are about to drop the column `interacted_count` on the `qa__pull_requests` table. All the data in the column will be lost.
  - You are about to drop the column `qa_ready_count` on the `qa__pull_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `qa__pull_requests` DROP COLUMN `interacted_count`,
    DROP COLUMN `qa_ready_count`,
    ADD COLUMN `agg_dev_block_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `agg_interacted_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `agg_qa_ready_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `agg_qa_stamped_count` INTEGER NOT NULL DEFAULT 0;
