/*
  Warnings:

  - The primary key for the `qa__pull_request_history` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `qa__pull_request_history` DROP PRIMARY KEY,
    MODIFY `event` ENUM('qa_ready', 'non_qa_ready', 'first_interaction', 'interacted', 'dev_blocked', 'un_dev_blocked', 'qa_stamped', 'closed', 'merged') NOT NULL,
    ADD PRIMARY KEY (`date`, `pull_request_id`, `event`);
