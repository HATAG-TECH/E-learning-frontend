export const baseCategories = [
  { id: 'cat-dev', name: 'Development' },
  { id: 'cat-design', name: 'Design' },
  { id: 'cat-data', name: 'Data Science' },
  { id: 'cat-marketing', name: 'Marketing' }
];

export const baseCourses = [
  {
    id: 'course-ai',
    title: 'Advanced AI Prompt Engineering',
    description: 'Master the art of communicating with AI. Learn advanced techniques for GPT-4, Midjourney, and more.',
    instructor: 'Default Instructor',
    authorId: 'u-instructor',
    category: 'Development',
    price: 79.99,
    rating: 4.9,
    students: 320,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'course-fs',
    title: 'Complete Full Stack Web Development',
    description: 'Learn MERN stack, Next.js, and cloud deployment. Build 10 real-world projects.',
    instructor: 'Default Instructor',
    authorId: 'u-instructor',
    category: 'Development',
    price: 99.99,
    rating: 4.8,
    students: 540,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'course-dm',
    title: 'Digital Marketing Masterclass',
    description: 'SEO, SEM, Social Media Marketing, and Analytics. Everything you need to grow a business online.',
    instructor: 'Emily Rodriguez',
    category: 'Marketing',
    price: 54.99,
    rating: 4.6,
    students: 1800,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'course-cs',
    title: 'Cybersecurity Fundamentals',
    description: 'Protect systems from cyber attacks. Learn ethical hacking, network security, and risk management.',
    instructor: 'Alex Rivera',
    category: 'Data Science',
    price: 89.99,
    rating: 4.7,
    students: 2600,
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
  }
];

export const baseUsers = [
  { id: 'u-student', email: 'student@example.com', role: 'Student', username: 'Default Student', password: 'password' },
  { id: 'u-instructor', email: 'instructor@example.com', role: 'Instructor', username: 'Default Instructor', password: 'password' },
  { id: 'u-admin', email: 'admin@gmail.com', role: 'Admin', username: 'Super Admin', password: '123@#$80aA' }
];
