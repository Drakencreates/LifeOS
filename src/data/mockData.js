// Mock Data for LifeOS

export const USER_PROFILE = {
  name: "Alex Dev",
  handle: "@alexdev",
  email: "alex.dev@lifeos.io",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  role: "Software Engineering Scholar & Builder",
  bio: "Lifelong learner, computer science enthusiast, and builder of digital experiences. Documenting the journey from university to tech innovations.",
  location: "New Delhi & Yogyakarta",
  joinedDate: "August 2022",
  website: "https://alexdev.me",
  stats: {
    totalEvents: 42,
    goalsCompleted: 18,
    activeGoals: 6,
    
    memoriesCaptured: 89,
    documentsArchived: 24,
    lifeScore: 94
  }
};

export const MOCK_EVENTS = [
  {
    id: "evt-1",
    title: "Started BTech Computer Science",
    category: "Education",
    date: "2022-08-16",
    year: "2022",
    location: "School of Engineering & Technology",
    description: "Commenced undergraduate studies in Computer Science and Engineering. Orientation day, meeting batchmates, and entering the world of programming algorithms.",
    isMilestone: true,
    status: "Completed",
    badgeColor: "indigo",
    tags: ["University", "Academics", "Orientation", "Milestone"]
  },
  {
    id: "evt-2",
    title: "Semester Exchange — Indonesia",
    category: "International",
    date: "2023-09-04",
    year: "2023",
    location: "Yogyakarta, Indonesia",
    description: "Selected for international student exchange program in Indonesia. Immersion in South-East Asian tech ecosystem, cross-cultural collaboration, and academic research.",
    isMilestone: true,
    status: "Completed",
    badgeColor: "emerald",
    tags: ["Exchange Program", "Travel", "Culture", "Global Experience"]
  },
  {
    id: "evt-3",
    title: "Completed DSA Milestone",
    category: "Skills",
    date: "2024-03-20",
    year: "2024",
    location: "Online / Code Platforms",
    description: "Crossed 150+ Data Structures & Algorithms challenges solved across LeetCode and HackerRank. Mastered trees, dynamic programming, and graph algorithms.",
    isMilestone: true,
    status: "Completed",
    badgeColor: "amber",
    tags: ["DSA", "LeetCode", "Problem Solving", "Competitive Coding"]
  },
  {
    id: "evt-4",
    title: "Started Java Full Stack Specialization",
    category: "Career",
    date: "2024-07-10",
    year: "2024",
    location: "Remote Academy",
    description: "Deep dive into enterprise Java development, Spring Boot microservices, Hibernate ORM, and modern web application architectural patterns.",
    isMilestone: false,
    status: "Completed",
    badgeColor: "blue",
    tags: ["Java", "Spring Boot", "Full Stack", "Backend"]
  },
  {
    id: "evt-5",
    title: "Completed LifeOS Project",
    category: "Projects",
    date: "2025-01-15",
    year: "2025",
    location: "Personal Lab",
    description: "Architected and delivered the comprehensive LifeOS platform foundation. Personal life tracking, milestone visualization, and document management system.",
    isMilestone: true,
    status: "Completed",
    badgeColor: "purple",
    tags: ["LifeOS", "React", "Frontend", "System Architecture"]
  },
  {
    id: "evt-6",
    title: "National Hackathon Finalist",
    category: "Achievement",
    date: "2025-04-12",
    year: "2025",
    location: "Innovation Hub, Bengaluru",
    description: "Built an AI-assisted health triage prototype with a team of four in a continuous 36-hour sprint. Ranked in the top 5 out of 180 teams.",
    isMilestone: true,
    status: "Completed",
    badgeColor: "rose",
    tags: ["Hackathon", "Innovation", "AI", "Teamwork"]
  },
  {
    id: "evt-7",
    title: "Summer Cloud Architecture Internship",
    category: "Career",
    date: "2025-06-01",
    year: "2025",
    location: "TechCorp Labs",
    description: "Joining cloud infrastructure team to learn Kubernetes, CI/CD pipeline automation, and distributed cloud computing.",
    isMilestone: false,
    status: "Upcoming",
    badgeColor: "cyan",
    tags: ["Internship", "Cloud", "DevOps", "Career Step"]
  }
];

export const MOCK_GOALS = [
  {
    id: "goal-1",
    title: "Complete 150 DSA problems",
    category: "Technical Skills",
    progress: 76,
    currentValue: 114,
    targetValue: 150,
    unit: "problems",
    targetDate: "2025-08-30",
    priority: "High",
    status: "In Progress",
    description: "Focus on dynamic programming, graphs, and system design algorithmic foundations.",
    color: "indigo"
  },
  {
    id: "goal-2",
    title: "Learn Spring Boot",
    category: "Backend Development",
    progress: 60,
    currentValue: 6,
    targetValue: 10,
    unit: "modules",
    targetDate: "2025-09-15",
    priority: "Medium",
    status: "In Progress",
    description: "Master Spring Security, RESTful endpoints, JPA Repository, and Docker containerization.",
    color: "blue"
  },
  {
    id: "goal-3",
    title: "Build 3 full-stack projects",
    category: "Portfolio",
    progress: 100,
    currentValue: 3,
    targetValue: 3,
    unit: "projects",
    targetDate: "2025-05-30",
    priority: "High",
    status: "Completed",
    description: "Shipped LifeOS UI shell, E-commerce dashboard, and Realtime collaborative whiteboard.",
    color: "emerald"
  },
  {
    id: "goal-4",
    title: "Read 12 Technical & Leadership Books",
    category: "Personal Growth",
    progress: 42,
    currentValue: 5,
    targetValue: 12,
    unit: "books",
    targetDate: "2025-12-31",
    priority: "Low",
    status: "In Progress",
    description: "Currently reading 'Designing Data-Intensive Applications' by Martin Kleppmann.",
    color: "amber"
  },
  {
    id: "goal-5",
    title: "Achieve AWS Cloud Practitioner Certification",
    category: "Certifications",
    progress: 25,
    currentValue: 2,
    targetValue: 8,
    unit: "chapters",
    targetDate: "2025-11-20",
    priority: "Medium",
    status: "On Hold",
    description: "Prepare practice exams and fundamental cloud services architecture overview.",
    color: "purple"
  }
];

export const MOCK_MEMORIES = [
  {
    id: "mem-1",
    title: "First day at university",
    date: "2022-08-16",
    location: "Campus Central Amphitheater",
    description: "Walking into the main computer science hall for the very first time. The nervous excitement, meeting my roommate, and opening our first textbook.",
    category: "Campus Life",
    mood: "Excited",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80",
    tags: ["Freshman", "Orientation", "Milestone"]
  },
  {
    id: "mem-2",
    title: "Indonesia Exchange",
    date: "2023-10-14",
    location: "Borobudur & Malioboro, Yogyakarta",
    description: "Exploring historical temples at dawn with international scholars. Trying authentic Gudeg and presenting our cross-cultural software design project.",
    category: "Travel & Culture",
    mood: "Grateful",
    image: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80",
    tags: ["Indonesia", "Exchange", "Wanderlust", "Global"]
  },
  {
    id: "mem-3",
    title: "Project presentation",
    date: "2024-11-28",
    location: "Auditorium Room 402",
    description: "Live demonstration of our distributed storage system in front of faculty professors and senior industry jurors. Got an enthusiastic standing applause.",
    category: "Academics",
    mood: "Proud",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
    tags: ["Presentation", "Team", "Finals", "Innovation"]
  },
  {
    id: "mem-4",
    title: "Late Night Hackathon Session",
    date: "2025-04-11",
    location: "Bengaluru Tech Park",
    description: "At 3:30 AM debugging WebSockets with coffee cups stacked like towers. The eureka moment when our sync engine connected seamlessly.",
    category: "Hacking",
    mood: "Electric",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    tags: ["Hackathon", "Coding", "Night Owls"]
  },
  {
    id: "mem-5",
    title: "Summit Hike with Friends",
    date: "2024-05-18",
    location: "Himachal Trails",
    description: "Reached the ridge peak at 9,500 feet after 6 hours of rocky ascent. Pure peace, crisp mountain air, and a refreshing break from screens.",
    category: "Outdoors",
    mood: "Peaceful",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    tags: ["Nature", "Trekking", "Recharge"]
  }
];

export const MOCK_DOCUMENTS = [
  {
    id: "doc-1",
    name: "Resume.pdf",
    category: "Career",
    size: "245 KB",
    type: "PDF",
    uploadDate: "2025-03-01",
    lastModified: "2025-03-10",
    status: "Verified",
    description: "Latest software engineering resume with project portfolio and exchange credentials."
  },
  {
    id: "doc-2",
    name: "Exchange Certificate.pdf",
    category: "Academic",
    size: "1.4 MB",
    type: "PDF",
    uploadDate: "2023-12-20",
    lastModified: "2023-12-20",
    status: "Verified",
    description: "Official student exchange transcript and completion certificate from partner university in Indonesia."
  },
  {
    id: "doc-3",
    name: "Project Report.pdf",
    category: "Projects",
    size: "3.8 MB",
    type: "PDF",
    uploadDate: "2025-01-20",
    lastModified: "2025-01-22",
    status: "Verified",
    description: "Final comprehensive documentation report and architecture blueprint for LifeOS System."
  },
  {
    id: "doc-4",
    name: "BTech Transcripts.pdf",
    category: "Academic",
    size: "890 KB",
    type: "PDF",
    uploadDate: "2024-12-05",
    lastModified: "2024-12-05",
    status: "Verified",
    description: "Cumulative GPA official mark sheets through semester 5."
  },
  {
    id: "doc-5",
    name: "Passport Scan.pdf",
    category: "Identification",
    size: "2.1 MB",
    type: "PDF",
    uploadDate: "2023-07-15",
    lastModified: "2023-07-15",
    status: "Secured",
    description: "Encrypted copy of passport identification pages for official visa records."
  },
  {
    id: "doc-6",
    name: "DSA Problem Solutions.zip",
    category: "Skills",
    size: "5.6 MB",
    type: "ZIP",
    uploadDate: "2024-04-02",
    lastModified: "2024-04-02",
    status: "Archived",
    description: "Archived Java and C++ clean solutions with comments and complexity annotations."
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Goal Milestone Achieved",
    message: "You completed 76% of 'Complete 150 DSA problems'!",
    time: "2 hours ago",
    unread: true,
    type: "goal"
  },
  {
    id: "notif-2",
    title: "Memory Reminder",
    message: "On this day in 2023, you began the Indonesia Semester Exchange.",
    time: "1 day ago",
    unread: true,
    type: "memory"
  },
  {
    id: "notif-3",
    title: "Document Verified",
    message: "Resume.pdf was synchronized and indexed for search.",
    time: "3 days ago",
    unread: false,
    type: "document"
  }
];

export const LIFE_OVERVIEW_CHART = [
  { year: "2022", events: 8, goals: 3, memories: 14 },
  { year: "2023", events: 12, goals: 5, memories: 26 },
  { year: "2024", events: 15, goals: 8, memories: 31 },
  { year: "2025", events: 7, goals: 6, memories: 18 }
];

export const CATEGORY_DISTRIBUTION = [
  { name: "Education", value: 35, color: "#4f46e5" },
  { name: "Career", value: 25, color: "#0ea5e9" },
  { name: "Projects", value: 20, color: "#8b5cf6" },
  { name: "Personal", value: 12, color: "#10b981" },
  { name: "Travel", value: 8, color: "#f59e0b" }
];
