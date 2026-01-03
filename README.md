# E-Learn Pro - Advanced Learning Management System

E-Learn Pro is a modern, comprehensive e-learning platform built with React.js. It features a robust multi-role system catering to Students, Instructors, and Administrators, providing a seamless educational experience.

## 🚀 Key Features

### 🎓 For Students
- **Course Catalog**: Browse and filter courses by category, level, and price.
- **Enrollment System**: Enroll in free or paid courses (mock payment flow).
- **Interactive Learning**: Access lessons with video content, PDFs, and resources.
- **Progress Tracking**: Visual progress bars and completion status.
- **Assignments & Quizzes**: Submit assignments and take quizzes with instant feedback.
- **Certificates**: Automatically generate downloadable certificates upon course completion.
- **Student Dashboard**: Track enrolled courses, earned certificates, and notifications.

### 👨‍🏫 For Instructors
- **Course Creation**: Comprehensive course builder with lessons, assignments, and quizzes.
- **Pricing Control**: Set course prices in ETB (Ethiopian Birr).
- **Resource Management**: Upload and manage course resources (PDFs, videos, links).
- **Grading System**: Grade student assignment submissions with feedback.
- **Analytics**: View estimated revenue and course performance metrics.
- **Instructor Dashboard**: Manage courses, students, and earnings.

### 🛡️ For Administrators
- **User Management**: View and manage all users (Students, Instructors).
- **Course Approval**: Review and approve/reject course drafts submitted by instructors.
- **System Overview**: High-level analytics of platform usage.


## 🛠️ Technology Stack

- **Frontend**: React.js (Vite)
- **Styling**: React Bootstrap, Custom CSS (Glassmorphism design), Bootstrap Icons
- **State Management**: React Context API (Auth, Data, UI, Theme)
- **Routing**: React Router DOM (with lazy loading)
- **Data Persistence**: LocalStorage (Mock backend)
- **Other Libraries**: 
  - `react-to-print` (Certificate printing)
  - `chart.js` (Analytics visualization)
  - `scrollreveal` (Animations)

## ⚙️ Setup & Installation
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Navigate to `http://localhost:5173`

## 🔐 Default Credentials

### Master Admin
- **Email**: `admin@gmail.com`
- **Password**: `123@#$80aA`

## 🎨 Theme & Customization

The application supports both Light and Dark modes.
- Toggle theme using the sun/moon icon in the navigation bar.
- Theme preference is persisted in LocalStorage.
- All colors use CSS variables for easy customization in `index.css`.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (Auth, Data, UI)
├── data/           # Mock data and initial state
├── pages/          # Main application pages
├── utils/          # Helper functions (storage, validation, formatting)
├── App.jsx         # Main application component & routing
└── main.jsx        # Entry point
```

