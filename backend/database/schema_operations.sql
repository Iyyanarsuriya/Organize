-- ==========================================
-- Manufacturing Sector Database Schema
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `google_refresh_token` text,
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expiry` datetime DEFAULT NULL,
  `role` enum('admin','user','owner','manager','staff') DEFAULT 'user',
  `owner_id` int DEFAULT NULL,
  `local_id` int DEFAULT NULL,
  `sector` varchar(50) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_reset_otp` (`reset_otp`,`reset_otp_expiry`),
  KEY `fk_user_owner` (`owner_id`),
  CONSTRAINT `fk_user_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `push_subscriptions`;
CREATE TABLE `push_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `push_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_projects`;
CREATE TABLE `manufacturing_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` enum('ongoing','completed','on-hold') DEFAULT 'ongoing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_proj_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_members`;
CREATE TABLE `manufacturing_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `wage_type` enum('daily','monthly','piece_rate') DEFAULT 'daily',
  `monthly_salary` decimal(15,2) DEFAULT '0.00',
  `daily_wage` decimal(15,2) DEFAULT '0.00',
  `cl_balance` decimal(5,2) DEFAULT '0.00',
  `sl_balance` decimal(5,2) DEFAULT '0.00',
  `el_balance` decimal(5,2) DEFAULT '0.00',
  `member_type` enum('employee','worker') DEFAULT 'worker',
  `project_id` int DEFAULT NULL,
  `shift_id` int DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_memb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_man_memb_proj` FOREIGN KEY (`project_id`) REFERENCES `manufacturing_projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_man_memb_shift` FOREIGN KEY (`shift_id`) REFERENCES `manufacturing_shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_transactions`;
CREATE TABLE `manufacturing_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(50) DEFAULT 'Other',
  `date` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `project_id` int DEFAULT NULL,
  `member_id` int DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'completed',
  `guest_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(15,2) DEFAULT '1.00',
  `unit_price` decimal(15,2) DEFAULT '0.00',
  `payroll_id` int DEFAULT NULL,
  `approval_id` int DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `auto_generated` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_man_trans_proj` (`project_id`),
  KEY `fk_man_trans_memb` (`member_id`),
  KEY `fk_man_trans_pay` (`payroll_id`),
  KEY `fk_man_trans_appr` (`approval_id`),
  CONSTRAINT `fk_man_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_man_trans_proj` FOREIGN KEY (`project_id`) REFERENCES `manufacturing_projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_man_trans_memb` FOREIGN KEY (`member_id`) REFERENCES `manufacturing_members` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_man_trans_pay` FOREIGN KEY (`payroll_id`) REFERENCES `manufacturing_payroll` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_man_trans_appr` FOREIGN KEY (`approval_id`) REFERENCES `manufacturing_approvals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_attendance`;
CREATE TABLE `manufacturing_attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `member_id` int DEFAULT NULL,
  `status` enum('present','absent','late','half-day','permission','week_off','holiday','CL','SL','EL','OD') NOT NULL,
  `subject` varchar(255) DEFAULT 'Daily Attendance',
  `date` date NOT NULL,
  `note` text,
  `project_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `total_hours` decimal(4,2) DEFAULT '0.00',
  `work_mode` enum('Office','WFH','On-site') DEFAULT 'Office',
  `permission_duration` varchar(100) DEFAULT NULL,
  `permission_start_time` varchar(20) DEFAULT NULL,
  `permission_end_time` varchar(20) DEFAULT NULL,
  `permission_reason` text,
  `overtime_duration` varchar(100) DEFAULT NULL,
  `overtime_reason` text,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_man_att_proj` (`project_id`),
  KEY `fk_man_att_memb` (`member_id`),
  CONSTRAINT `fk_man_att_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_man_att_proj` FOREIGN KEY (`project_id`) REFERENCES `manufacturing_projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_man_att_memb` FOREIGN KEY (`member_id`) REFERENCES `manufacturing_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_work_logs`;
CREATE TABLE `manufacturing_work_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `member_id` int DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `units_produced` decimal(15,2) DEFAULT '0.00',
  `rate_per_unit` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) GENERATED ALWAYS AS ((`units_produced` * `rate_per_unit`)) STORED,
  `work_type` varchar(100) DEFAULT 'production',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_date` (`user_id`,`date`),
  KEY `idx_member` (`member_id`),
  CONSTRAINT `fk_man_wl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_man_wl_memb` FOREIGN KEY (`member_id`) REFERENCES `manufacturing_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_expense_categories`;
CREATE TABLE `manufacturing_expense_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(20) DEFAULT '#2d5bff',
  `type` enum('income','expense') DEFAULT 'expense',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_man_cat` (`user_id`,`name`,`type`),
  CONSTRAINT `fk_man_cat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_reminder_categories`;
CREATE TABLE `manufacturing_reminder_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#2d5bff',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_mfg_rem_cat` (`user_id`,`name`),
  CONSTRAINT `fk_man_rem_cat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_vehicle_logs`;
CREATE TABLE `manufacturing_vehicle_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `vehicle_name` varchar(100) DEFAULT NULL,
  `vehicle_number` varchar(50) NOT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `in_time` datetime DEFAULT NULL,
  `out_time` datetime DEFAULT NULL,
  `start_km` decimal(15,2) DEFAULT NULL,
  `end_km` decimal(15,2) DEFAULT NULL,
  `expense_amount` decimal(15,2) DEFAULT '0.00',
  `income_amount` decimal(15,2) DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_veh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_member_roles`;
CREATE TABLE `manufacturing_member_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_man_role` (`user_id`,`name`),
  CONSTRAINT `fk_man_role_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_work_types`;
CREATE TABLE `manufacturing_work_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_man_worktype` (`user_id`,`name`),
  CONSTRAINT `fk_man_wt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_reminders`;
CREATE TABLE `manufacturing_reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `due_date` datetime DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `is_completed` tinyint(1) DEFAULT '0',
  `status` varchar(50) DEFAULT 'pending',
  `category` varchar(50) DEFAULT 'General',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_remind_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_notes`;
CREATE TABLE `manufacturing_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `color` varchar(20) DEFAULT 'yellow',
  `is_pinned` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_notes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_holidays`;
CREATE TABLE `manufacturing_holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `type` enum('National','Regional','Company','Other') DEFAULT 'National',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_hol_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_shifts`;
CREATE TABLE `manufacturing_shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_duration` int DEFAULT '60',
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_man_shift_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_payroll`;
CREATE TABLE `manufacturing_payroll` (
    `id` int NOT NULL AUTO_INCREMENT,
    `member_id` int NOT NULL,
    `month` int NOT NULL COMMENT '1-12',
    `year` int NOT NULL COMMENT 'YYYY',
    `days_present` int DEFAULT '0',
    `days_absent` int DEFAULT '0',
    `days_half` int DEFAULT '0',
    `days_leave` int DEFAULT '0',
    `days_holiday` int DEFAULT '0',
    `days_weekend` int DEFAULT '0',
    `overtime_hours` decimal(10,2) DEFAULT '0.00',
    `base_amount` decimal(15,2) NOT NULL,
    `overtime_amount` decimal(15,2) DEFAULT '0.00',
    `gross_amount` decimal(15,2) NOT NULL,
    `advance_deducted` decimal(15,2) DEFAULT '0.00',
    `loan_deducted` decimal(15,2) DEFAULT '0.00',
    `other_deductions` decimal(15,2) DEFAULT '0.00',
    `total_deductions` decimal(15,2) DEFAULT '0.00',
    `net_amount` decimal(15,2) NOT NULL,
    `status` enum('draft','approved','paid','cancelled') DEFAULT 'draft',
    `approved_by` varchar(100) DEFAULT NULL,
    `approved_at` datetime DEFAULT NULL,
    `paid_at` datetime DEFAULT NULL,
    `payment_mode` enum('cash','bank','upi','cheque') DEFAULT 'bank',
    `expense_id` int DEFAULT NULL,
    `project_id` int DEFAULT NULL,
    `notes` text,
    `user_id` int NOT NULL,
    `created_by` varchar(100) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_by` varchar(100) DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_payroll` (`member_id`,`month`,`year`,`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_month_year` (`month`,`year`),
    KEY `idx_member` (`member_id`),
    CONSTRAINT `fk_man_pay_memb` FOREIGN KEY (`member_id`) REFERENCES `manufacturing_members` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_man_pay_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_approvals`;
CREATE TABLE `manufacturing_approvals` (
    `id` int NOT NULL AUTO_INCREMENT,
    `entity_type` enum('expense','payroll','attendance') NOT NULL,
    `entity_id` int NOT NULL,
    `amount` decimal(15,2) DEFAULT '0.00',
    `title` varchar(255) DEFAULT NULL,
    `description` text,
    `requested_by` varchar(100) NOT NULL,
    `requested_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `approver_level` int DEFAULT '1',
    `required_level` int DEFAULT '1',
    `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
    `approved_by` varchar(100) DEFAULT NULL,
    `approved_at` datetime DEFAULT NULL,
    `rejection_reason` text,
    `approver_comments` text,
    `user_id` int NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_entity` (`entity_type`,`entity_id`),
    KEY `idx_status` (`status`),
    CONSTRAINT `fk_man_appr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_expense_locks`;
CREATE TABLE `manufacturing_expense_locks` (
    `id` int NOT NULL AUTO_INCREMENT,
    `month` int NOT NULL,
    `year` int NOT NULL,
    `locked_by` varchar(100) NOT NULL,
    `locked_at` datetime DEFAULT CURRENT_TIMESTAMP,
    `lock_reason` varchar(255) DEFAULT 'Month-end closing',
    `unlocked_by` varchar(100) DEFAULT NULL,
    `unlocked_at` datetime DEFAULT NULL,
    `unlock_reason` varchar(255) DEFAULT NULL,
    `status` enum('locked','unlocked') DEFAULT 'locked',
    `user_id` int NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_lock` (`month`,`year`,`user_id`),
    CONSTRAINT `fk_man_lock_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_advances`;
CREATE TABLE `manufacturing_advances` (
    `id` int NOT NULL AUTO_INCREMENT,
    `member_id` int NOT NULL,
    `amount` decimal(15,2) NOT NULL,
    `advance_date` date NOT NULL,
    `reason` varchar(255) DEFAULT NULL,
    `total_deducted` decimal(15,2) DEFAULT '0.00',
    `balance` decimal(15,2) DEFAULT '0.00',
    `monthly_deduction` decimal(15,2) DEFAULT '0.00',
    `status` enum('active','fully_paid','cancelled') DEFAULT 'active',
    `user_id` int NOT NULL,
    `created_by` varchar(100) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_member` (`member_id`),
    CONSTRAINT `fk_man_adv_memb` FOREIGN KEY (`member_id`) REFERENCES `manufacturing_members` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_man_adv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_payroll_settings`;
CREATE TABLE `manufacturing_payroll_settings` (
    `id` int NOT NULL AUTO_INCREMENT,
    `working_days_per_month` int DEFAULT '26',
    `working_hours_per_day` int DEFAULT '8',
    `working_hours_per_month` int DEFAULT '208',
    `overtime_multiplier` decimal(5,2) DEFAULT '1.50',
    `auto_deduct_advances` tinyint(1) DEFAULT '1',
    `advance_deduction_percentage` int DEFAULT '100',
    `expense_approval_threshold` decimal(15,2) DEFAULT '10000.00',
    `payroll_requires_approval` tinyint(1) DEFAULT '1',
    `user_id` int NOT NULL,
    `updated_by` varchar(100) DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_settings` (`user_id`),
    CONSTRAINT `fk_man_set_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `manufacturing_attendance_locks`;
CREATE TABLE `manufacturing_attendance_locks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `locked_by` varchar(100) NOT NULL,
  `locked_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `unlocked_by` varchar(100) DEFAULT NULL,
  `unlocked_at` datetime DEFAULT NULL,
  `lock_reason` varchar(255) DEFAULT 'Attendance finalized',
  `status` enum('locked','unlocked') DEFAULT 'locked',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_mfg_att_lock` (`user_id`,`month`,`year`),
  CONSTRAINT `fk_mfg_att_lock_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
