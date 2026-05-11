-- 任务绩效管理系统数据库初始化脚本

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS taskdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskdb;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed', 'scored') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    performance_weight TINYINT UNSIGNED DEFAULT 5 CHECK (performance_weight BETWEEN 1 AND 10),
    due_date DATE NOT NULL,
    completed_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务评分表
CREATE TABLE IF NOT EXISTS task_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL UNIQUE,
    scorer_id INT NOT NULL,
    score TINYINT UNSIGNED NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (scorer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_scorer_id (scorer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 绩效统计表
CREATE TABLE IF NOT EXISTS performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    year SMALLINT UNSIGNED NOT NULL,
    month TINYINT UNSIGNED NOT NULL,
    total_score DECIMAL(5,2) DEFAULT 0,
    task_count INT UNSIGNED DEFAULT 0,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month (user_id, year, month),
    INDEX idx_ranking (year, month, total_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员账号 (密码: root123)
-- 密码哈希值通过 password_hash('root123', PASSWORD_DEFAULT) 生成
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@example.com', '$2y$10$Zyj/v7iPVTM6/APYOBjblO/BZf7h106hAeCbPFJ9bIrjtlv78V48O', 'admin', 1);

-- 插入测试普通用户 (密码: 123456)
INSERT INTO users (username, email, password_hash, role, is_active) VALUES
('testuser', 'test@example.com', '$2y$10$/Sv3FlwATv89TMSxgt0H/.4Q5xusS1COSt3Sh7jDfmh6clcxZX2HO', 'user', 1);

-- 插入示例任务
INSERT INTO tasks (user_id, title, description, status, priority, performance_weight, due_date) VALUES
(2, '完成项目需求文档', '编写详细的项目需求文档，包含功能描述和技术规范', 'pending', 'high', 8, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
(2, '代码审查', '对团队成员提交的代码进行审查和反馈', 'in_progress', 'medium', 5, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
(2, '修复登录Bug', '修复用户反馈的登录页面样式问题', 'completed', 'low', 3, DATE_ADD(CURDATE(), INTERVAL -1 DAY));
