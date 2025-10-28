-- ============================================================================
-- Database Performance Optimization - Add Missing Indexes
-- Thai MOOC Platform
-- ============================================================================

USE thai_mooc;

-- ============================================================================
-- 1. COURSES TABLE
-- Existing: idx_courses_created_at, idx_courses_level
-- ============================================================================

-- CREATE INDEX idx_courses_created_at ON courses(createdAt DESC); -- Already exists
-- CREATE INDEX idx_courses_level ON courses(level); -- Already exists
CREATE INDEX idx_courses_institution_level ON courses(institutionId, level);
CREATE INDEX idx_courses_institution_created ON courses(institutionId, createdAt DESC);
CREATE INDEX idx_courses_has_certificate ON courses(hasCertificate);

-- ============================================================================
-- 2. INSTRUCTORS TABLE
-- ============================================================================

CREATE INDEX idx_instructors_created_at ON instructors(createdAt DESC);
CREATE INDEX idx_instructors_institution_created ON instructors(institutionId, createdAt DESC);

-- ============================================================================
-- 3. INSTITUTIONS TABLE
-- ============================================================================

CREATE INDEX idx_institutions_created_at ON institutions(createdAt DESC);
CREATE INDEX idx_institutions_abbreviation ON institutions(abbreviation);

-- ============================================================================
-- 4. CATEGORIES TABLE
-- ============================================================================

CREATE INDEX idx_categories_created_at ON categories(createdAt DESC);
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================================================
-- 5. COURSE_TYPES TABLE
-- ============================================================================

CREATE INDEX idx_course_types_created_at ON course_types(createdAt DESC);

-- ============================================================================
-- 6. NEWS TABLE
-- ============================================================================

CREATE INDEX idx_news_created_at ON news(createdAt DESC);

-- ============================================================================
-- 7. BANNERS TABLE
-- ============================================================================

CREATE INDEX idx_banners_active_order ON banners(isActive, `order` ASC);
CREATE INDEX idx_banners_order ON banners(`order` ASC);
CREATE INDEX idx_banners_created_at ON banners(createdAt DESC);

-- ============================================================================
-- 8. ADMIN_USERS TABLE
-- Note: admin_users_email_key and admin_users_username_key already exist
-- ============================================================================

-- Already has unique indexes on email and username

-- ============================================================================
-- Analyze tables to update statistics
-- ============================================================================

ANALYZE TABLE courses;
ANALYZE TABLE instructors;
ANALYZE TABLE institutions;
ANALYZE TABLE categories;
ANALYZE TABLE course_types;
ANALYZE TABLE news;
ANALYZE TABLE banners;
ANALYZE TABLE admin_users;
ANALYZE TABLE course_categories;
ANALYZE TABLE course_course_types;
ANALYZE TABLE course_instructors;

SELECT 'Database indexes optimization completed!' as Status;

-- ============================================================================
-- Show all indexes for verification
-- ============================================================================

SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
    CASE WHEN NON_UNIQUE = 0 THEN 'UNIQUE' ELSE 'NON-UNIQUE' END as UNIQUENESS
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'thai_mooc'
    AND TABLE_NAME IN (
        'courses', 'instructors', 'institutions', 'categories',
        'course_types', 'news', 'banners', 'admin_users'
    )
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;
