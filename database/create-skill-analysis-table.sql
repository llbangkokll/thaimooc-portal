-- ============================================================================
-- Create course_skill_analysis table
-- Thai MOOC Platform - Skill Analysis Feature
-- ============================================================================

USE thai_mooc;

-- Create table for storing skill analysis results
CREATE TABLE IF NOT EXISTS course_skill_analysis (
  id VARCHAR(191) PRIMARY KEY,
  courseId VARCHAR(191) NOT NULL,
  hardSkills JSON NOT NULL COMMENT 'Hard skill scores (H1-H6): 0-100',
  softSkills JSON NOT NULL COMMENT 'Soft skill scores (S1-S6): 0-100',
  reasoning TEXT COMMENT 'AI reasoning for the analysis',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  -- Foreign key
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,

  -- Index for fast lookup
  INDEX idx_skill_analysis_course (courseId),
  INDEX idx_skill_analysis_created (createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show table structure
DESCRIBE course_skill_analysis;

-- Show indexes
SHOW INDEX FROM course_skill_analysis;

SELECT 'course_skill_analysis table created successfully!' as Status;
