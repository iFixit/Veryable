/*
  Warnings:

  - You are about to drop the `qa_pulls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `qa_pulls`;

-- CreateTable
CREATE TABLE `qa__pull_requests` (
    `repo` VARCHAR(100) NOT NULL DEFAULT '',
    `pull_number` INTEGER UNSIGNED NOT NULL,
    `state` ENUM('OPEN', 'CLOSED', 'MERGED') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `head_ref` CHAR(40) NOT NULL,
    `qa_req` INTEGER NOT NULL DEFAULT 1,
    `created_at` INTEGER UNSIGNED,
    `updated_at` INTEGER UNSIGNED,
    `closed_at` INTEGER UNSIGNED,
    `merged_at` INTEGER UNSIGNED,
    `closes` INTEGER UNSIGNED,
    `interacted` BOOLEAN DEFAULT false,
    `interacted_count` INTEGER NOT NULL DEFAULT 0,
    `qa_ready` BOOLEAN DEFAULT false,
    `qa_ready_count` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`repo`, `pull_number`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
