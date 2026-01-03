import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { baseCourses, baseCategories } from '../data/mockData.js';
import { useAuth } from './AuthContext.jsx';
import { getData, setData } from '../utils/storage.js';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { users } = useAuth();
  const [courses, setCourses] = useState(() => {
    const saved = getData('courses', []);
    return saved.length > 0 ? saved : baseCourses;
  });
  const [categories, setCategories] = useState(() => getData('categories', baseCategories));
  const [enrollments, setEnrollments] = useState(() => getData('enrollments', []));
  const [approvals, setApprovals] = useState(() => getData('approvals', []));
  const [lessonCompletions, setLessonCompletions] = useState(() => getData('lessonCompletions', []));
  const [quizAttempts, setQuizAttempts] = useState(() => getData('quizAttempts', []));
  const [assignments, setAssignments] = useState(() => getData('assignments', []));
  const [assignmentSubmissions, setAssignmentSubmissions] = useState(() => getData('assignmentSubmissions', []));
  const [instructorQuizzes, setInstructorQuizzes] = useState(() => getData('instructorQuizzes', []));
  const [certificates, setCertificates] = useState(() => getData('certificates', []));
  const [courseReviews, setCourseReviews] = useState(() => getData('courseReviews', []));
  const [notifications, setNotifications] = useState(() => getData('notifications', []));

  useEffect(() => {
    // Ensure base courses are always available even if storage was partial
    setCourses(prev => {
      const missing = baseCourses.filter(bc => !prev.some(pc => pc.id === bc.id));
      if (missing.length > 0) return [...prev, ...missing];
      return prev;
    });
  }, []);

  useEffect(() => setData('courses', courses), [courses]);
  useEffect(() => setData('categories', categories), [categories]);
  useEffect(() => setData('enrollments', enrollments), [enrollments]);
  useEffect(() => setData('approvals', approvals), [approvals]);
  useEffect(() => setData('lessonCompletions', lessonCompletions), [lessonCompletions]);
  useEffect(() => setData('quizAttempts', quizAttempts), [quizAttempts]);
  useEffect(() => setData('assignments', assignments), [assignments]);
  useEffect(() => setData('assignmentSubmissions', assignmentSubmissions), [assignmentSubmissions]);
  useEffect(() => setData('instructorQuizzes', instructorQuizzes), [instructorQuizzes]);
  useEffect(() => setData('certificates', certificates), [certificates]);
  useEffect(() => setData('courseReviews', courseReviews), [courseReviews]);
  useEffect(() => setData('notifications', notifications), [notifications]);

  const generateId = (prefix = '') => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const enroll = (userId, courseId, paymentStatus = 'paid') => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      console.error('Enrollment failed: User not found', userId);
      return { success: false, message: 'User not found. Please try logging in again.' };
    }
    if (user.role !== 'Student') {
      return { success: false, message: 'Only students can enroll in courses.' };
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      return { success: false, message: 'Course not found.' };
    }

    // Check if already enrolled
    if (enrollments.some(e => e.userId === userId && e.courseId === courseId)) {
      return { success: false, message: 'You are already enrolled in this course.' };
    }

    // Only allow enrollment in approved courses
    const isApproved = course.status === 'approved' || course.status === 'live' || !course.status;
    if (!isApproved) {
      return { success: false, message: 'This course is pending approval and cannot be enrolled yet.' };
    }

    const newEnrollment = {
      id: generateId('enroll-'),
      userId,
      courseId,
      progress: 0,
      paymentStatus,
      enrolledAt: new Date().toISOString()
    };

    setEnrollments((prev) => {
      // (Double check inside setter just in case)
      if (prev.some((e) => e.userId === userId && e.courseId === courseId)) return prev;
      return [...prev, newEnrollment];
    });

    addNotification(userId, 'New Course Enrollment', `You have successfully enrolled in ${course.title}!`, 'success');

    return { success: true, message: 'Successfully enrolled!' };
  };

  const updateProgress = (userId, courseId, progress) => {
    setEnrollments((prev) =>
      prev.map((e) => (e.userId === userId && e.courseId === courseId ? { ...e, progress } : e))
    );
  };

  const addCourseDraft = (course) => {
    const draft = { ...course, id: generateId('course-'), status: 'pending' };
    setApprovals((prev) => [...prev, draft]);
    // Also add to courses with pending status so instructor can start building content
    // But it won't show in catalog until approved
    setCourses((prev) => [...prev, draft]);

    // Notify admin about new course submission
    const adminUser = users.find(u => u.role === 'Admin' && u.email === 'admin@gmail.com');
    if (adminUser) {
      addNotification(
        adminUser.id,
        'New Course Submission',
        `${course.instructor} has submitted "${course.title}" for approval.`,
        'info',
        { courseId: draft.id, type: 'course_approval' }
      );
    }
  };

  const approveCourse = (courseId, approved) => {
    const course = courses.find(c => c.id === courseId);

    if (approved) {
      // 1. Update status in courses list
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: 'approved' } : c))
      );
      // 2. Remove from approvals queue
      setApprovals((prev) => prev.filter((c) => c.id !== courseId));

      if (course) {
        addNotification(course.authorId, 'Course Approved!', `Your course "${course.title}" has been approved and is now live.`, 'success');
      }
    } else {
      // 1. Remove from courses list entirely
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      // 2. Remove from approvals queue
      setApprovals((prev) => prev.filter((c) => c.id !== courseId));

      if (course) {
        addNotification(course.authorId, 'Course Rejected', `Your course "${course.title}" was not approved by the admin.`, 'danger');
      }
    }
  };

  const deleteCourse = (courseId) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setApprovals((prev) => prev.filter((c) => c.id !== courseId));
    // Also remove any related enrollments/reviews if we want to be thorough
    setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId));
    setCourseReviews((prev) => prev.filter((r) => r.courseId !== courseId));
  };

  const completeLesson = (userId, courseId, lessonIndex) => {
    const key = `${userId}-${courseId}-${lessonIndex}`;
    setLessonCompletions((prev) => {
      if (prev.some((l) => l.key === key)) return prev;
      const updated = [...prev, { key, userId, courseId, lessonIndex, completedAt: new Date().toISOString() }];
      // Update course progress
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        const totalLessons = course.lessons?.length || 1;
        const completedLessons = updated.filter((l) => l.courseId === courseId && l.userId === userId).length;
        const progress = Math.round((completedLessons / totalLessons) * 100);
        updateProgress(userId, courseId, progress);
      }
      return updated;
    });
  };

  const isLessonCompleted = (userId, courseId, lessonIndex) => {
    const key = `${userId}-${courseId}-${lessonIndex}`;
    return lessonCompletions.some((l) => l.key === key);
  };

  const saveQuizAttempt = (userId, courseId, score, total, passed) => {
    setQuizAttempts((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId,
        courseId,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        passed,
        completedAt: new Date().toISOString()
      }
    ]);
  };

  const getQuizAttempts = (userId, courseId) => {
    return quizAttempts.filter((q) => q.userId === userId && q.courseId === courseId);
  };

  const addAssignment = (courseId, assignment) => {
    const newAssignment = {
      id: generateId('assign-'),
      courseId,
      ...assignment,
      createdAt: new Date().toISOString()
    };
    setAssignments((prev) => [...prev, newAssignment]);
    return newAssignment;
  };

  const getAssignments = (courseId) => {
    return assignments.filter((a) => a.courseId === courseId);
  };

  const updateAssignment = (assignmentId, updates) => {
    setAssignments((prev) => prev.map((a) => (a.id === assignmentId ? { ...a, ...updates } : a)));
  };

  const submitAssignment = (userId, assignmentId, submission) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    const course = courses.find(c => c.id === assignment?.courseId);
    const student = users.find(u => u.id === userId);
    const studentName = student?.username || student?.email || 'A student';

    const newSubmission = {
      id: generateId('sub-'),
      userId,
      assignmentId,
      ...submission,
      submittedAt: new Date().toISOString()
    };
    setAssignmentSubmissions((prev) => [...prev, newSubmission]);

    if (course?.authorId) {
      addNotification(
        course.authorId,
        'New Assignment Submission',
        `${studentName} has submitted the assignment "${assignment?.title}" for your course "${course?.title}".`,
        'info',
        { submissionId: newSubmission.id, courseId: course.id }
      );
    }

    return newSubmission;
  };

  const getAssignmentSubmissions = (assignmentId) => {
    return assignmentSubmissions.filter((s) => s.assignmentId === assignmentId);
  };

  const gradeAssignment = (submissionId, grade, feedback) => {
    setAssignmentSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, grade, feedback, gradedAt: new Date().toISOString(), graded: true }
          : s
      )
    );

    const submission = assignmentSubmissions.find(s => s.id === submissionId);
    if (submission) {
      addNotification(submission.userId, 'Assignment Graded', `Your assignment has been graded. Score: ${grade}`, 'info');
    }
  };

  const getSubmissionsByCourse = (courseId) => {
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    const assignmentIds = courseAssignments.map((a) => a.id);
    return assignmentSubmissions.filter((s) => assignmentIds.includes(s.assignmentId));
  };

  const addInstructorQuiz = (courseId, quiz) => {
    const newQuiz = {
      id: generateId('quiz-'),
      courseId,
      ...quiz,
      createdAt: new Date().toISOString()
    };
    setInstructorQuizzes((prev) => [...prev, newQuiz]);
    return newQuiz;
  };

  const getInstructorQuizzes = (courseId) => {
    return instructorQuizzes.filter((q) => q.courseId === courseId);
  };

  const updateInstructorQuiz = (quizId, updates) => {
    setInstructorQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, ...updates } : q)));
  };

  const updateCourse = (courseId, updates) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c)));
  };

  const canGenerateCertificate = (userId, courseId) => {
    const enroll = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
    if (!enroll || enroll.progress < 100) return false;

    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;

    // Strict Criteria:
    // 1. All lessons must be "completed" (handled by enroll.progress === 100).
    // 2. If quizzes exist, average score must be >= 70%.
    // 3. If assignments exist, average score of GRADED assignments must be >= 70%, 
    //    AND all assignments must be submitted (optional strictness, here we check average).

    // Quiz Check
    const attempts = getQuizAttempts(userId, courseId);
    const hasQuizzes = course.lessons?.some(l => l.quizId) || instructorQuizzes.some(q => q.courseId === courseId);

    // If quizzes exist but no attempts, fail.
    if (hasQuizzes && attempts.length === 0) {
      return false;
    }

    if (attempts.length > 0) {
      const avgQuiz = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
      if (avgQuiz < 70) return false;
    }

    // Assignment Check
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    if (courseAssignments.length > 0) {
      const assignmentIds = courseAssignments.map((a) => a.id);
      const mySubs = assignmentSubmissions.filter(
        (s) => s.userId === userId && assignmentIds.includes(s.assignmentId) && s.graded
      );

      // If assignments exist but none are graded, cannot complete.
      if (mySubs.length === 0) return false;

      const avgAssign = mySubs.reduce((sum, s) => {
        const assignment = courseAssignments.find(a => a.id === s.assignmentId);
        const max = assignment?.maxScore || 100; // Default to 100 if missing to avoid division by zero issues
        const percentage = Math.round(((s.grade || 0) / max) * 100);
        return sum + percentage;
      }, 0) / mySubs.length;

      if (avgAssign < 70) return false;
    }

    return true;
  };

  const generateCertificate = (userId, courseId) => {
    if (!canGenerateCertificate(userId, courseId)) return null;
    const exists = certificates.find((c) => c.userId === userId && c.courseId === courseId);
    if (exists) return exists;

    const course = courses.find((c) => c.id === courseId);
    const user = users.find((u) => u.id === userId);
    const studentName = user?.username || user?.email || 'Learner';

    const certificate = {
      id: generateId('cert-'),
      userId,
      courseId,
      studentEmail: user?.email,
      studentName: studentName,
      courseTitle: course?.title,
      instructor: course?.instructor,
      issuedAt: new Date().toISOString()
    };
    setCertificates((prev) => [...prev, certificate]);
    addNotification(userId, 'New Certificate Earned', `Congratulations! You've earned a certificate for ${course?.title}!`, 'success');
    return certificate;
  };

  const getCertificatesForUser = (userId) => {
    return certificates.filter((c) => c.userId === userId);
  };

  const addOrUpdateReview = (userId, courseId, rating, comment) => {
    const now = new Date().toISOString();
    setCourseReviews((prev) => {
      const existingIdx = prev.findIndex((r) => r.userId === userId && r.courseId === courseId);
      const base = { userId, courseId, rating, comment, createdAt: now };
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...base, updatedAt: now };
        return updated;
      }
      return [...prev, { id: generateId('rev-'), ...base }];
    });
  };

  const getReviewsForCourse = (courseId) => {
    return courseReviews.filter((r) => r.courseId === courseId);
  };

  const addNotification = (userId, title, message, type = 'info', data = null) => {
    const newNotif = {
      id: generateId('notif-'),
      userId,
      title,
      message,
      type,
      read: false,
      data,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const clearNotifications = (userId) => {
    setNotifications(prev => prev.filter(n => n.userId !== userId));
  };

  const getNotificationsForUser = (userId) => {
    return notifications.filter(n => n.userId === userId);
  };

  const value = useMemo(
    () => ({
      courses,
      categories,
      users,
      enrollments,
      approvals,
      lessonCompletions,
      quizAttempts,
      assignments,
      assignmentSubmissions,
      instructorQuizzes,
      certificates,
      courseReviews,
      notifications,
      enroll,
      updateProgress,
      addCourseDraft,
      approveCourse,
      completeLesson,
      isLessonCompleted,
      saveQuizAttempt,
      getQuizAttempts,
      addAssignment,
      getAssignments,
      submitAssignment,
      getAssignmentSubmissions,
      addInstructorQuiz,
      getInstructorQuizzes,
      updateInstructorQuiz,
      updateCourse,
      updateAssignment,
      gradeAssignment,
      getSubmissionsByCourse,
      canGenerateCertificate,
      generateCertificate,
      getCertificatesForUser,
      addOrUpdateReview,
      getReviewsForCourse,
      deleteCourse,
      addNotification,
      markNotificationAsRead,
      clearNotifications,
      getNotificationsForUser
    }),
    [
      courses,
      categories,
      users,
      enrollments,
      approvals,
      lessonCompletions,
      quizAttempts,
      assignments,
      assignmentSubmissions,
      instructorQuizzes,
      certificates,
      courseReviews,
      notifications
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);

