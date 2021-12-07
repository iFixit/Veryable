-- CreateTable
CREATE TABLE `qa__commits` (
    `commit_event_id` VARCHAR(255) NOT NULL,
    `sha` VARCHAR(40) NOT NULL,
    `qa_ready` BOOLEAN DEFAULT false,
    `interacted` BOOLEAN DEFAULT false,
    `dev_blocked` BOOLEAN DEFAULT false,
    `qa_stamped` BOOLEAN DEFAULT false,
    `ci_status` ENUM('PENDING', 'ERROR', 'FAILURE', 'SUCCESS', 'EXPECTED'),
    `committed_at` INTEGER NOT NULL,
    `pushed_at` INTEGER,
    `pull_request_id` VARCHAR(255),

    INDEX `qa__commits_pull_request_id_idx`(`pull_request_id`),
    UNIQUE INDEX `qa__commits_sha_pull_request_id_key`(`sha`, `pull_request_id`),
    PRIMARY KEY (`commit_event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qa__commits` ADD CONSTRAINT `qa__commits_ibfk_1` FOREIGN KEY (`pull_request_id`) REFERENCES `qa__pull_requests`(`pull_request_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
