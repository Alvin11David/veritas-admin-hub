export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  media?: Array<{
    id: string;
    url: string;
    fileName: string;
    type: "image" | "video";
    size: number;
    uploadedAt: string;
  }>;
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  bio: string;
  specialization: string;
  photoUrl: string;
  displayOrder: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  featuredImage: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  responded: boolean;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  type: "create" | "update" | "delete";
}

export const dashboardStats = [
  { label: "News Articles", count: 24, icon: "Newspaper" },
  { label: "Courses", count: 48, icon: "BookOpen" },
  { label: "Faculty", count: 36, icon: "Users" },
  { label: "Events", count: 12, icon: "Calendar" },
  { label: "Gallery Images", count: 156, icon: "Image" },
  { label: "FAQs", count: 32, icon: "HelpCircle" },
  { label: "Programs", count: 18, icon: "GraduationCap" },
  { label: "Quick Links", count: 8, icon: "Link" },
  { label: "Research", count: 14, icon: "FlaskConical" },
  { label: "Alumni", count: 42, icon: "Award" },
  { label: "Scholarships", count: 16, icon: "DollarSign" },
  { label: "Student Stories", count: 20, icon: "MessageSquare" },
  { label: "Legal Pages", count: 6, icon: "FileText" },
  { label: "Submissions", count: 89, icon: "Mail" },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "1",
    action: "Published",
    target: "Spring Enrollment Opens",
    user: "Admin",
    timestamp: "2 min ago",
    type: "create",
  },
  {
    id: "2",
    action: "Updated",
    target: "Dr. Sarah Chen profile",
    user: "Admin",
    timestamp: "15 min ago",
    type: "update",
  },
  {
    id: "3",
    action: "Created",
    target: "Commencement 2026 event",
    user: "Editor",
    timestamp: "1 hour ago",
    type: "create",
  },
  {
    id: "4",
    action: "Deleted",
    target: "Outdated FAQ entry",
    user: "Admin",
    timestamp: "2 hours ago",
    type: "delete",
  },
  {
    id: "5",
    action: "Updated",
    target: "Computer Science curriculum",
    user: "Editor",
    timestamp: "3 hours ago",
    type: "update",
  },
  {
    id: "6",
    action: "Published",
    target: "Alumni Spotlight: J. Rivera",
    user: "Admin",
    timestamp: "5 hours ago",
    type: "create",
  },
];

export const mockNews: NewsArticle[] = [
  {
    id: "1",
    title: "Spring 2026 Enrollment Now Open",
    excerpt: "Registration for spring semester courses is now available.",
    content: "Full article content here...",
    featuredImage: "",
    published: true,
    createdAt: "2026-03-15",
    updatedAt: "2026-03-15",
  },
  {
    id: "2",
    title: "New Research Lab Opening",
    excerpt: "The Veritas Institute opens state-of-the-art research facility.",
    content: "Full article content here...",
    featuredImage: "",
    published: true,
    createdAt: "2026-03-10",
    updatedAt: "2026-03-12",
  },
  {
    id: "3",
    title: "Faculty Achievement Awards",
    excerpt: "Three faculty members recognized for outstanding contributions.",
    content: "Full article content here...",
    featuredImage: "",
    published: false,
    createdAt: "2026-03-05",
    updatedAt: "2026-03-05",
  },
  {
    id: "4",
    title: "Student Hackathon Results",
    excerpt: "Annual hackathon draws record participation.",
    content: "Full article content here...",
    featuredImage: "",
    published: true,
    createdAt: "2026-02-28",
    updatedAt: "2026-03-01",
  },
];

export const mockFaculty: FacultyMember[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    title: "Professor",
    department: "Computer Science",
    email: "s.chen@veritas.edu",
    bio: "Expert in machine learning and AI.",
    specialization: "Artificial Intelligence",
    photoUrl: "",
    displayOrder: 1,
  },
  {
    id: "2",
    name: "Dr. James Miller",
    title: "Associate Professor",
    department: "Mathematics",
    email: "j.miller@veritas.edu",
    bio: "Specializes in applied mathematics.",
    specialization: "Applied Mathematics",
    photoUrl: "",
    displayOrder: 2,
  },
  {
    id: "3",
    name: "Dr. Maria Rodriguez",
    title: "Department Chair",
    department: "Biology",
    email: "m.rodriguez@veritas.edu",
    bio: "Leading researcher in genetics.",
    specialization: "Molecular Biology",
    photoUrl: "",
    displayOrder: 3,
  },
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Commencement Ceremony 2026",
    date: "2026-05-20",
    time: "10:00 AM",
    location: "Main Auditorium",
    description: "Annual graduation ceremony.",
    featuredImage: "",
  },
  {
    id: "2",
    title: "Open House Day",
    date: "2026-04-15",
    time: "9:00 AM",
    location: "Campus Wide",
    description: "Prospective students campus tour.",
    featuredImage: "",
  },
  {
    id: "3",
    title: "Research Symposium",
    date: "2026-04-25",
    time: "2:00 PM",
    location: "Science Hall",
    description: "Faculty and student research presentations.",
    featuredImage: "",
  },
];

export const mockContacts: ContactSubmission[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    subject: "Admission Inquiry",
    message: "I would like information about the CS program.",
    createdAt: "2026-04-01",
    read: false,
    responded: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Scholarship Question",
    message: "What scholarships are available for international students?",
    createdAt: "2026-03-30",
    read: true,
    responded: false,
  },
  {
    id: "3",
    name: "Alex Johnson",
    email: "alex@example.com",
    subject: "Event Registration",
    message: "How do I register for the open house?",
    createdAt: "2026-03-28",
    read: true,
    responded: true,
  },
];
