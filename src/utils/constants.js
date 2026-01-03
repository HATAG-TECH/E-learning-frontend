// Application-wide constants

// Admin credentials
export const MASTER_ADMIN_EMAIL = 'admin@gmail.com';
export const MASTER_ADMIN_PASSWORD = '123@#$80aA';
export const MASTER_ADMIN_ID = 'u-admin';

// Course statuses
export const COURSE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived'
};

// User roles
export const USER_ROLES = {
    STUDENT: 'Student',
    INSTRUCTOR: 'Instructor',
    ADMIN: 'Admin'
};

// Notification types
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger',
    PRIMARY: 'primary'
};

// Course categories
export const COURSE_CATEGORIES = {
    DEVELOPMENT: 'Development',
    DESIGN: 'Design',
    DATA_SCIENCE: 'Data Science',
    MARKETING: 'Marketing',
    BUSINESS: 'Business'
};

// Course levels
export const COURSE_LEVELS = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced'
};

// Certificate requirements
export const CERTIFICATE_REQUIREMENTS = {
    MIN_PROGRESS: 100,
    MIN_QUIZ_SCORE: 70,
    MIN_ASSIGNMENT_SCORE: 70
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const ITEMS_PER_PAGE_OPTIONS = [6, 12, 24, 48];

// File upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
