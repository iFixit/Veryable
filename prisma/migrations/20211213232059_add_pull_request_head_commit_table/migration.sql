-- CreateTable
CREATE TABLE `qa__pull_request_commit` (
    `pull_request_id` VARCHAR(255) NOT NULL,
    `head_ref` VARCHAR(255),

    UNIQUE INDEX `head_ref`(`head_ref`),
    PRIMARY KEY (`pull_request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qa__pull_request_commit` ADD CONSTRAINT `qa__pull_request_commit_ibfk_3` FOREIGN KEY (`head_ref`) REFERENCES `qa__commits`(`commit_event_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `qa__pull_request_commit` ADD CONSTRAINT `qa__pull_request_commit_ibfk_2` FOREIGN KEY (`pull_request_id`) REFERENCES `qa__pull_requests`(`pull_request_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
