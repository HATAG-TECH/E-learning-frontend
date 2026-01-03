## 1. Enrolled courses not visible after re-login

**Issue**  
Students are unable to see their previously enrolled courses when they log in again.

**Requirements**
- Persist student enrollments across sessions.
- On successful login, load and display all enrolled courses in:
  - Student Dashboard  
  - “My Learning” / “Enrolled Courses” page
- Ensure enrollments are correctly linked to the logged-in user account (by user ID/email).
- Display a clear empty-state message if the student has not enrolled in any courses yet.

---

## 2. Course enrollment should require payment

**Issue**  
Courses can be enrolled without a proper payment flow.

**Requirements**
- Implement a payment step in the enrollment process for paid courses.
- Each course should have:
  - A defined price (amount + currency)
  - A label (e.g., “Free” or “Paid”)
- Only confirm enrollment after:
  - Successful payment authorization/confirmation
- Store payment status with enrollment:
  - Paid / Not Paid
- Show appropriate messages:
  - “Payment required” before enrollment  
  - “Payment successful” or error messages on failure

---

## 3. Course creation must include tags

**Issue**  
Course creation currently lacks a dedicated input for tags.

**Requirements**
- Add a **Tags** input field in the course creation/edit form.
- Allow multiple tags per course (e.g., “JavaScript”, “Beginner”, “React”).
- (Optional) Provide tag suggestion or autocomplete from existing tags.
- Display tags in:
  - Course details page  
  - Course catalog (e.g., as small chips/badges)
- (Optional but recommended) Enable filtering/searching by tags.

---

## 4. Light/Dark mode toggle as icons

**Issue**  
Theme switching (light/dark mode) should be more intuitive and visually clear.

**Requirements**
- Replace text-based toggle with icon-based buttons:
  - Sun icon for light mode
  - Moon icon for dark mode
- Icon behavior:
  - If in light mode → show **moon** icon (click to switch to dark)
  - If in dark mode → show **sun** icon (click to switch to light)
- Maintain current behavior:
  - Theme persistence using `localStorage` or similar.
- Ensure accessibility:
  - Add appropriate `aria-label` (e.g., “Toggle dark mode”).

---

## 5. Certification system based on defined criteria

**Issue**  
Certification is not yet implemented; it should depend on clear completion criteria.

**Requirements**
- Generate a course completion certificate when a student meets all criteria.
- **Basic criteria (requested):**
  - Course fully completed (100% lesson completion)
  - Passing grade in quizzes
  - Passing grade in assignments
- **Additional recommended criteria:**
  - Minimum overall quiz average (e.g., ≥ 70%)
  - Minimum average assignment score (e.g., ≥ 70%)
  - No outstanding/overdue mandatory assignments
  - Student has marked the course as “Completed” (optional final confirmation)
- **Certificate features:**
  - Student name
  - Course title
  - Instructor name
  - Completion date
  - Unique certificate ID
- **Display certificate:**
  - In student dashboard (Certificates section)
  - Option to view/download (PDF/image).

---

## 6. Footer section

**Issue**  
The application currently lacks a footer.

**Requirements**
- Add a global footer visible on all main pages.
- Recommended footer contents:
  - Copyright notice
  - Basic navigation links (About, Contact, FAQ, Terms & Conditions, Privacy Policy)
  - Social media links (if applicable)
  - Contact email or support link
- Ensure responsive design and consistent styling with the site theme.

---

## 7. Course rating and comments after completion

**Issue**  
Students cannot currently rate or comment on courses after taking them.

**Requirements**
- Allow students to:
  - Rate a course (e.g., 1–5 stars)
  - Write a review/comment after completing or substantially progressing through the course.
- Display this feedback on the **Course Details** page:
  - Average rating
  - Number of ratings
  - List of student reviews (name, rating, comment, date)
- Prevent abuse:
  - Only enrolled students can rate/comment
  - Limit one rating per student per course (allow edit/update instead of duplicates)
- (Optional) Allow sorting/filtering of reviews (Most recent, Highest rated, etc.).

---

## 8. Remove “Number of learners” from course card

**Issue**  
The “number of learners” field on the course card should be removed.

**Requirements**
- Remove or hide the “Number of learners” display from:
  - Course cards in the catalog
  - Any other listing views showing this count (if not accurate/needed)
- Ensure the layout of the course card remains visually balanced after removal.

---

## 9. Enhanced sign-up form with validation

**Issue**  
The sign-up page needs proper fields and validation, including strong password enforcement.

**Requirements**
- **Sign-up form fields:**
  - Username
  - Email
  - Password
  - Confirm Password
- **Validation rules:**
  - **Username:**
    - Required
    - Reasonable length limits (e.g., 3–20 characters)
  - **Email:**
    - Required
    - Valid email format
    - (Optional) Check for uniqueness (no duplicate accounts)
  - **Password:**
    - Required
    - Strong password policy, e.g.:
      - Minimum length (≥ 8 characters)
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one number
      - At least one special character
  - **Confirm Password:**
    - Required
    - Must match the Password field
- **User feedback:**
  - Inline error messages near each invalid field
  - Real-time validation (optional but recommended)
  - Clear success message on successful registration
