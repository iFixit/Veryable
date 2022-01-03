-- CreateTable
CREATE TABLE `qa__daily_metrics` (
    `date` INTEGER NOT NULL,
    `pull_count` INTEGER NOT NULL DEFAULT 0,
    `pulls_added` INTEGER NOT NULL DEFAULT 0,
    `pulls_interacted` INTEGER NOT NULL DEFAULT 0,
    `unique_pulls_added` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qa_pulls` (
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
