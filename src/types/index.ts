export type AchievementCategory =
  | 'Projects'
  | 'Internships'
  | 'Hackathons'
  | 'Certifications'
  | 'Course Completion Certificates'
  | 'Extracurricular Activities'
  | 'Other Academic Achievements';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string; // e.g., 'O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'
  marks?: number; // 0-100
}

export interface SemesterRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  semesterNumber: number; // 1 to 8
  sgpa: number; // 0.0 - 10.0
  subjects: SubjectItem[];
  status: 'unverified' | 'verified';
  academicYear?: string;
  remarks?: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  fullName: string;
  collegeEmail: string;
  branch: string;
  currentSemester: number;
  skills: string[];
  careerInterests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FacultyProfile {
  id: string;
  fullName: string;
  email: string;
  department?: string;
  createdAt: string;
}

export interface AchievementSubmission {
  id: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  branch: string;
  title: string;
  category: AchievementCategory;
  description: string;
  organization: string;
  completionDate: string;
  documentUrl?: string;
  documentName?: string;
  documentSize?: number;
  documentMimeType?: string;
  projectUrl?: string;
  status: VerificationStatus;
  facultyFeedback?: string;
  reviewedByFacultyName?: string;
  reviewedByFacultyEmail?: string;
  reviewedAt?: string;
  pointsAwarded: number;
  isResubmission?: boolean;
  resubmissionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceScoreBreakdown {
  overallScore: number; // 0 - 100
  academicComponent: number; // 0 - 50 (normalized from CGPA)
  verifiedAchievementComponent: number; // 0 - 30 (normalized from verified achievements)
  skillComponent: number; // 0 - 20 (normalized from skills & completed activities)
  isProvisional: boolean;
  cgpa: number | null;
  totalSubmissions: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  explanation: string;
}

export interface AISkillImprovement {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  rationale: string;
  recommendedLearning: string;
}

export interface AIRecommendedProject {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  techStack: string[];
  whyRelevant: string;
}

export interface AILearningTopic {
  topic: string;
  category: string;
  summary: string;
}

export interface AIInternshipPrep {
  action: string;
  timeline: string;
  keyAdvice: string;
}

export interface AIPlacementMilestone {
  milestone: string;
  targetSemester: string;
  checklist: string[];
}

export interface AICareerRoadmap {
  targetCareerProfile: string;
  skillsToImprove: AISkillImprovement[];
  recommendedProjects: AIRecommendedProject[];
  learningTopics: AILearningTopic[];
  internshipPrep: AIInternshipPrep[];
  placementRoadmap: AIPlacementMilestone[];
  disclaimer: string;
}

export interface SystemStatus {
  firebaseConfigured: boolean;
  firestoreStatusMessage: string;
  geminiConfigured: boolean;
  geminiModel: string;
  storageMode: 'server-persistent' | 'firebase-firestore';
}
