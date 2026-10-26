import type {
  StudentProfile,
  FacultyProfile,
  SemesterRecord,
  AchievementSubmission,
  AICareerRoadmap,
  SystemStatus,
  AchievementCategory,
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) {
    throw new Error('Failed to fetch system status.');
  }
  return res.json();
}

// Student profile methods
export async function registerOrUpdateStudent(data: {
  rollNumber: string;
  fullName: string;
  collegeEmail: string;
  branch: string;
  currentSemester: number;
  skills?: string[];
  careerInterests?: string[];
}): Promise<{ student: StudentProfile; isNew: boolean }> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to register or update student.');
  }
  return body;
}

export async function searchReturningStudent(
  rollNumber: string,
  collegeEmail: string
): Promise<StudentProfile> {
  const params = new URLSearchParams({
    roll: rollNumber.trim(),
    email: collegeEmail.trim(),
  });
  const res = await fetch(`${API_BASE}/students/search?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Student profile not found. Please register as a new student.');
  }
  return body.student;
}

export async function fetchStudentDetails(studentId: string): Promise<{
  student: StudentProfile | null;
  semesters: SemesterRecord[];
  achievements: AchievementSubmission[];
}> {
  try {
    if (!studentId || !studentId.trim()) {
      return { student: null, semesters: [], achievements: [] };
    }
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId.trim())}`);
    if (res.status === 404) {
      return { student: null, semesters: [], achievements: [] };
    }
    const body = await res.json();
    if (!res.ok) {
      return { student: null, semesters: [], achievements: [] };
    }
    return {
      student: body.student || null,
      semesters: Array.isArray(body.semesters) ? body.semesters : [],
      achievements: Array.isArray(body.achievements) ? body.achievements : [],
    };
  } catch {
    return { student: null, semesters: [], achievements: [] };
  }
}

export async function updateStudentProfile(
  studentId: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  const res = await fetch(`${API_BASE}/students/${studentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to update student profile.');
  }
  return body.student;
}

export async function fetchAllStudents(): Promise<Array<StudentProfile & {
  cgpa: number | null;
  totalAchievements: number;
  verifiedAchievements: number;
  pendingAchievements: number;
}>> {
  const res = await fetch(`${API_BASE}/students`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to fetch students.');
  }
  return body.students;
}

// Faculty methods
export async function loginFaculty(data: {
  fullName: string;
  email: string;
  department?: string;
}): Promise<{ faculty: FacultyProfile; isNew: boolean }> {
  const res = await fetch(`${API_BASE}/faculty/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to process faculty sign in.');
  }
  return body;
}

// Semesters methods
export async function fetchStudentSemesters(studentId: string): Promise<SemesterRecord[]> {
  const res = await fetch(`${API_BASE}/semesters/${studentId}`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to fetch semesters.');
  }
  return body.semesters;
}

export async function saveSemesterRecord(data: {
  studentId: string;
  rollNumber: string;
  semesterNumber: number;
  sgpa: number;
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    credits: number;
    grade: string;
    marks?: number;
  }>;
  remarks?: string;
}): Promise<SemesterRecord> {
  const res = await fetch(`${API_BASE}/semesters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to save semester record.');
  }
  return body.semester;
}

// Achievement methods
export async function fetchAchievements(filters?: {
  studentId?: string;
  status?: string;
  category?: string;
  branch?: string;
}): Promise<AchievementSubmission[]> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('studentId', filters.studentId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.branch) params.append('branch', filters.branch);

  const res = await fetch(`${API_BASE}/achievements?${params.toString()}`);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to fetch achievements.');
  }
  return body.achievements;
}

export async function submitAchievement(data: {
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
}): Promise<AchievementSubmission> {
  const res = await fetch(`${API_BASE}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to submit achievement.');
  }
  return body.achievement;
}

export async function updateOrResubmitAchievement(
  achievementId: string,
  data: Partial<AchievementSubmission> & { resubmissionNotes?: string }
): Promise<AchievementSubmission> {
  const res = await fetch(`${API_BASE}/achievements/${achievementId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to update achievement.');
  }
  return body.achievement;
}

export async function reviewAchievement(
  achievementId: string,
  data: {
    status: 'verified' | 'rejected';
    facultyName?: string;
    facultyEmail?: string;
    feedback?: string;
  }
): Promise<AchievementSubmission> {
  const res = await fetch(`${API_BASE}/achievements/${achievementId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to submit review.');
  }
  return body.achievement;
}

export async function verifyAchievement(
  achievementId: string,
  facultyData?: { fullName?: string; email?: string }
): Promise<AchievementSubmission> {
  const res = await fetch(`${API_BASE}/achievements/${achievementId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'verified',
      facultyName: facultyData?.fullName,
      facultyEmail: facultyData?.email,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to verify achievement.');
  }
  return body.achievement;
}

// Upload supporting file
export async function uploadDocumentFile(file: File): Promise<{
  documentUrl: string;
  documentName: string;
  documentSize: number;
  documentMimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await fetch(`${API_BASE}/upload-document`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileBase64: base64Data,
          }),
        });

        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error || 'Failed to upload document file.');
        }

        resolve(body);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// AI Career Roadmap
export async function generateAICareerGuide(payload: {
  student: StudentProfile;
  semesters: SemesterRecord[];
  verifiedAchievements: AchievementSubmission[];
}): Promise<AICareerRoadmap> {
  const res = await fetch(`${API_BASE}/gemini/career-guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Failed to generate AI career recommendations.');
  }
  return body.roadmap;
}
