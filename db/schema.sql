DROP TABLE IF EXISTS `qa_metrics`;
CREATE TABLE `qa_metrics` (
  `date` int NOT NULL,
  `pull_count` int NOT NULL DEFAULT '0',
  `pulls_added` int NOT NULL DEFAULT '0',
  `pulls_interacted` int NOT NULL DEFAULT '0',
  `unique_pulls_added` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`date`)
);
--
DROP TABLE IF EXISTS `qa_pulls`;
CREATE TABLE `qa_pulls` (
  `repo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `pull_number` int unsigned NOT NULL,
  `state` enum('OPEN', 'CLOSED', 'MERGED') NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_ref` char(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `qa_req` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` int unsigned DEFAULT NULL,
  `updated_at` int unsigned DEFAULT NULL,
  `closed_at` int unsigned DEFAULT NULL,
  `merged_at` int unsigned DEFAULT NULL,
  `closes` int unsigned DEFAULT NULL,
  `interacted` tinyint(1) DEFAULT '0',
  `interacted_count` int NOT NULL DEFAULT '0',
  `qa_ready` tinyint(1) DEFAULT '0',
  `qa_ready_count` int NOT NULL DEFAULT '0' PRIMARY KEY (`repo`, `pull_number`)
);
--