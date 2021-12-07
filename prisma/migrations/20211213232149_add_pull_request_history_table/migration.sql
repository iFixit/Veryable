-- CreateTable
CREATE TABLE `qa__pull_request_history` (
    `start_date` INTEGER NOT NULL,
    `date` INTEGER NOT NULL,
    `pull_request_id` VARCHAR(255) NOT NULL,
    `commit_sha` VARCHAR(40) NOT NULL,
    `event` ENUM('qa_ready', 'non_qa_ready', 'first_interaction', 'interacted', 'dev_blocked', 'un_dev_blocked', 'qa_stamped') NOT NULL,
    `actor` VARCHAR(40),
    `pull_request_event_index` INTEGER NOT NULL,
    `commit_event_id` VARCHAR(255) NOT NULL,

    INDEX `qa__pull_request_history_commit_sha_idx`(`commit_sha`),
    INDEX `qa__pull_request_history_pull_request_id_idx`(`pull_request_id`),
    PRIMARY KEY (`date`, `pull_request_id`, `event`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qa__pull_request_history` ADD CONSTRAINT `qa__commit_history_ibfk_1` FOREIGN KEY (`commit_event_id`) REFERENCES `qa__commits`(`commit_event_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qa__pull_request_history` ADD CONSTRAINT `qa__pull_request_history_ibfk_1` FOREIGN KEY (`pull_request_id`) REFERENCES `qa__pull_requests`(`pull_request_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
