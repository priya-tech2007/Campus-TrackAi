import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type {
  StudentProfile,
  FacultyProfile,
  SemesterRecord,
  AchievementSubmission,
  AICareerRoadmap,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with 20MB limit for document uploads/base64 certificates
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Directories for persistent data and uploads
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'campustrack_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial DB Schema
interface DatabaseSchema {
  students: StudentProfile[];
  faculty: FacultyProfile[];
  semesters: SemesterRecord[];
  achievements: AchievementSubmission[];
}

function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        students: [],
        faculty: [],
        semesters: [],
        achievements: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading persistent database:', err);
    return { students: [], faculty: [], semesters: [], achievements: [] };
  }
}

function writeDatabase(data: DatabaseSchema): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing persistent database:', err);
    return false;
  }
}

// Check for Firebase applet config
const FIREBASE_CONFIG_PATH = path.resolve(__dirname, 'firebase-applet-config.json');
function checkFirebaseConfig(): { configured: boolean; details: string } {
  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    try {
      const content = fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf-8');
      const cfg = JSON.parse(content);
      if (cfg.projectId && cfg.projectId !== 'remixed-project-id') {
        return {
          configured: true,
          details: `Firebase Firestore configured for project "${cfg.projectId}".`,
        };
      }
    } catch {
      // ignore
    }
  }
  return {
    configured: false,
    details:
      'Firebase Firestore is not yet linked via project setup. The application is running with server-authoritative disk persistence (data/campustrack_db.json).',
  };
}

// System Status API
app.get('/api/status', (_req, res) => {
  const fb = checkFirebaseConfig();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);

  res.json({
    firebaseConfigured: fb.configured,
    firestoreStatusMessage: fb.details,
    geminiConfigured,
    geminiModel: 'gemini-3.8-flash',
    storageMode: fb.configured ? 'firebase-firestore' : 'server-persistent',
  });
});

// Document Upload API: stores document on disk and returns URL
app.post('/api/upload-document', (req, res) => {
  try {
    const { fileName, fileType, fileBase64, fileSize } = req.body;

    if (!fileBase64 || !fileName) {
      res.status(400).json({ error: 'Missing required file data or fileName.' });
      return;
    }

    // Basic size validation: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileSize && fileSize > MAX_SIZE) {
      res.status(400).json({ error: 'File size exceeds 10MB limit.' });
      return;
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const ext = path.extname(fileName) || '.bin';
    const safeBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const diskFileName = `${uniqueId}_${safeBase}${ext}`;
    const filePath = path.resolve(UPLOADS_DIR, diskFileName);

    fs.writeFileSync(filePath, buffer);

    const docUrl = `/api/documents/${diskFileName}`;

    res.json({
      success: true,
      documentUrl: docUrl,
      documentName: fileName,
      documentSize: buffer.length,
      documentMimeType: fileType || 'application/octet-stream',
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Failed to upload document: ' + (err.message || String(err)) });
  }
});

// Serve uploaded documents
app.get('/api/documents/:fileName', (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = path.resolve(UPLOADS_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Document not found.');
    return;
  }

  res.sendFile(filePath);
});

// Student APIs
// 1. Get or Create Student Profile
app.post('/api/students', (req, res) => {
  try {
    const { rollNumber, fullName, collegeEmail, branch, currentSemester, skills, careerInterests } = req.body;

    if (!rollNumber || !collegeEmail) {
      res.status(400).json({ error: 'Roll number and college email are required.' });
      return;
    }

    const trimmedRoll = String(rollNumber).trim().toUpperCase();
    const trimmedEmail = String(collegeEmail).trim().toLowerCase();

    const db = readDatabase();
    // Check if student exists by rollNumber or email
    const existingIndex = db.students.findIndex(
      (s) => s.rollNumber.toUpperCase() === trimmedRoll || s.collegeEmail.toLowerCase() === trimmedEmail
    );

    if (existingIndex >= 0) {
      const existing = db.students[existingIndex];
      // Update if details provided
      if (fullName && fullName.trim()) {
        existing.fullName = fullName.trim();
      }
      if (branch) existing.branch = branch;
      if (currentSemester) existing.currentSemester = Number(currentSemester);
      if (Array.isArray(skills)) existing.skills = skills;
      if (Array.isArray(careerInterests)) existing.careerInterests = careerInterests;
      existing.updatedAt = new Date().toISOString();

      db.students[existingIndex] = existing;
      writeDatabase(db);
      res.json({ success: true, student: existing, isNew: false });
      return;
    }

    // New student requires fullName and branch
    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Full name is required for new student registration.' });
      return;
    }

    const newStudent: StudentProfile = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rollNumber: trimmedRoll,
      fullName: fullName.trim(),
      collegeEmail: trimmedEmail,
      branch: branch || 'Computer Science & Engineering',
      currentSemester: Number(currentSemester) || 1,
      skills: Array.isArray(skills) ? skills : [],
      careerInterests: Array.isArray(careerInterests) ? careerInterests : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.students.push(newStudent);
    writeDatabase(db);

    res.json({ success: true, student: newStudent, isNew: true });
  } catch (err: any) {
    console.error('Student registration error:', err);
    res.status(500).json({ error: 'Failed to process student profile.' });
  }
});

// Search returning student by roll & email
app.get('/api/students/search', (req, res) => {
  try {
    const roll = req.query.roll ? String(req.query.roll).trim().toUpperCase() : '';
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';

    if (!roll || !email) {
      res.status(400).json({ error: 'Both Roll Number and College Email are required to locate profile.' });
      return;
    }

    const db = readDatabase();
    const student = db.students.find(
      (s) => s.rollNumber.toUpperCase() === roll && s.collegeEmail.toLowerCase() === email
    );

    if (!student) {
      res.status(404).json({ error: 'No student profile found with the provided Roll Number and College Email.' });
      return;
    }

    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ error: 'Database search error.' });
  }
});

// Get single student profile with semesters and achievements
app.get('/api/students/:id', (req, res) => {
  try {
    const db = readDatabase();
    const rawTarget = req.params.id ? String(req.params.id).trim() : '';
    if (!rawTarget) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }
    const student = db.students.find(
      (s: StudentProfile) =>
        s.id === rawTarget ||
        s.rollNumber.toUpperCase() === rawTarget.toUpperCase() ||
        s.collegeEmail.toLowerCase() === rawTarget.toLowerCase()
    );

    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const semesters = db.semesters.filter((sem) => sem.studentId === student.id);
    const achievements = db.achievements.filter((ach) => ach.studentId === student.id);

    res.json({
      student,
      semesters,
      achievements,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching student record.' });
  }
});

// Update student profile (skills, career interests, name, branch)
app.put('/api/students/:id', (req, res) => {
  try {
    const db = readDatabase();
    const studentIndex = db.students.findIndex((s) => s.id === req.params.id);

    if (studentIndex < 0) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const current = db.students[studentIndex];
    const { fullName, branch, currentSemester, skills, careerInterests } = req.body;

    if (fullName) current.fullName = fullName.trim();
    if (branch) current.branch = branch;
    if (currentSemester) current.currentSemester = Number(currentSemester);
    if (Array.isArray(skills)) current.skills = skills;
    if (Array.isArray(careerInterests)) current.careerInterests = careerInterests;
    current.updatedAt = new Date().toISOString();

    db.students[studentIndex] = current;
    writeDatabase(db);

    res.json({ success: true, student: current });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student profile.' });
  }
});

// List all students (for faculty view and leaderboard)
app.get('/api/students', (_req, res) => {
  try {
    const db = readDatabase();
    // Return students with their achievements count and CGPA
    const enriched = db.students.map((std) => {
      const studentSemesters = db.semesters.filter((s) => s.studentId === std.id && s.sgpa > 0);
      let cgpa: number | null = null;
      if (studentSemesters.length > 0) {
        const sum = studentSemesters.reduce((acc, curr) => acc + curr.sgpa, 0);
        cgpa = Number((sum / studentSemesters.length).toFixed(2));
      }

      const studentAchievements = db.achievements.filter((a) => a.studentId === std.id);
      const verifiedAchievements = studentAchievements.filter((a) => a.status === 'verified');
      const pendingAchievements = studentAchievements.filter((a) => a.status === 'pending');

      return {
        ...std,
        cgpa,
        totalAchievements: studentAchievements.length,
        verifiedAchievements: verifiedAchievements.length,
        pendingAchievements: pendingAchievements.length,
      };
    });

    res.json({ students: enriched });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching students.' });
  }
});

// Faculty APIs
app.post('/api/faculty/login', (req, res) => {
  try {
    const { fullName, email, department } = req.body;
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Faculty email is required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const db = readDatabase();
    let faculty = db.faculty.find((f) => f.email.toLowerCase() === trimmedEmail);

    if (faculty) {
      if (fullName && fullName.trim()) {
        faculty.fullName = fullName.trim();
      }
      if (department) faculty.department = department;
      writeDatabase(db);
      res.json({ success: true, faculty, isNew: false });
      return;
    }

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Faculty name is required for registration.' });
      return;
    }

    faculty = {
      id: `fac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: fullName.trim(),
      email: trimmedEmail,
      department: department || 'Engineering Faculty',
      createdAt: new Date().toISOString(),
    };

    db.faculty.push(faculty);
    writeDatabase(db);

    res.json({ success: true, faculty, isNew: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Faculty processing error.' });
  }
});

// Semester Records APIs
app.get('/api/semesters/:studentId', (req, res) => {
  try {
    const db = readDatabase();
    const records = db.semesters.filter((s) => s.studentId === req.params.studentId);
    res.json({ semesters: records });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching semester records.' });
  }
});

app.post('/api/semesters', (req, res) => {
  try {
    const { studentId, rollNumber, semesterNumber, sgpa, subjects, remarks } = req.body;

    if (!studentId || !semesterNumber) {
      res.status(400).json({ error: 'Student ID and semester number (1-8) are required.' });
      return;
    }

    const semNum = Number(semesterNumber);
    if (semNum < 1 || semNum > 8) {
      res.status(400).json({ error: 'Semester number must be between 1 and 8.' });
      return;
    }

    const calculatedSgpa = Number(sgpa) >= 0 ? Number(Number(sgpa).toFixed(2)) : 0;
    const db = readDatabase();

    const existingIdx = db.semesters.findIndex(
      (s) => s.studentId === studentId && s.semesterNumber === semNum
    );

    const record: SemesterRecord = {
      id: existingIdx >= 0 ? db.semesters[existingIdx].id : `sem_${Date.now()}_${semNum}`,
      studentId,
      rollNumber: rollNumber || '',
      semesterNumber: semNum,
      sgpa: calculatedSgpa,
      subjects: Array.isArray(subjects) ? subjects : [],
      status: 'unverified', // Unverified until faculty review
      remarks: remarks || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db.semesters[existingIdx] = record;
    } else {
      db.semesters.push(record);
    }

    writeDatabase(db);
    res.json({ success: true, semester: record });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save semester record.' });
  }
});

// Achievement Submissions APIs
app.get('/api/achievements', (req, res) => {
  try {
    const { studentId, status, category, branch } = req.query;
    const db = readDatabase();

    let list = db.achievements;
    if (studentId) {
      list = list.filter((a) => a.studentId === String(studentId));
    }
    if (status && status !== 'all') {
      list = list.filter((a) => a.status === String(status));
    }
    if (category && category !== 'all') {
      list = list.filter((a) => a.category === String(category));
    }
    if (branch && branch !== 'all') {
      list = list.filter((a) => a.branch === String(branch));
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ achievements: list });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve achievements.' });
  }
});

app.post('/api/achievements', (req, res) => {
  try {
    const {
      studentId,
      rollNumber,
      studentName,
      branch,
      title,
      category,
      description,
      organization,
      completionDate,
      documentUrl,
      documentName,
      documentSize,
      documentMimeType,
      projectUrl,
    } = req.body;

    if (!studentId || !title || !category || !organization || !completionDate) {
      res.status(400).json({ error: 'Please fill all required achievement fields.' });
      return;
    }

    const db = readDatabase();
    const newAchievement: AchievementSubmission = {
      id: `ach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      studentId,
      rollNumber: rollNumber || '',
      studentName: studentName || 'Student',
      branch: branch || 'Computer Science',
      title: title.trim(),
      category,
      description: description ? description.trim() : '',
      organization: organization.trim(),
      completionDate,
      documentUrl: documentUrl || '',
      documentName: documentName || '',
      documentSize: documentSize || 0,
      documentMimeType: documentMimeType || '',
      projectUrl: projectUrl ? projectUrl.trim() : '',
      status: 'pending',
      pointsAwarded: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.achievements.push(newAchievement);
    writeDatabase(db);

    res.json({ success: true, achievement: newAchievement });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit achievement.' });
  }
});

// Update / Resubmit rejected achievement
app.put('/api/achievements/:id', (req, res) => {
  try {
    const db = readDatabase();
    const idx = db.achievements.findIndex((a) => a.id === req.params.id);

    if (idx < 0) {
      res.status(404).json({ error: 'Achievement not found.' });
      return;
    }

    const current = db.achievements[idx];
    const {
      title,
      category,
      description,
      organization,
      completionDate,
      documentUrl,
      documentName,
      documentSize,
      documentMimeType,
      projectUrl,
      resubmissionNotes,
    } = req.body;

    if (title) current.title = title.trim();
    if (category) current.category = category;
    if (description !== undefined) current.description = description.trim();
    if (organization) current.organization = organization.trim();
    if (completionDate) current.completionDate = completionDate;
    if (documentUrl) {
      current.documentUrl = documentUrl;
      current.documentName = documentName || current.documentName;
      current.documentSize = documentSize || current.documentSize;
      current.documentMimeType = documentMimeType || current.documentMimeType;
    }
    if (projectUrl !== undefined) current.projectUrl = projectUrl.trim();

    // If was rejected, reset to pending for re-evaluation
    if (current.status === 'rejected') {
      current.status = 'pending';
      current.isResubmission = true;
      current.resubmissionNotes = resubmissionNotes || 'Updated supporting proof submitted for re-review.';
    }

    current.updatedAt = new Date().toISOString();
    db.achievements[idx] = current;
    writeDatabase(db);

    res.json({ success: true, achievement: current });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update achievement.' });
  }
});

// Faculty Review Action: Verify or Reject
const handleReviewOrVerify = (req: any, res: any, forcedStatus?: 'verified' | 'rejected') => {
  try {
    const rawStatus = forcedStatus || req.body.status || 'verified';
    const status = rawStatus === 'rejected' ? 'rejected' : 'verified';
    const facultyName = (req.body.facultyName || req.body.reviewerName || req.body.name || 'Faculty Evaluator').trim();
    const facultyEmail = (req.body.facultyEmail || req.body.reviewerEmail || req.body.email || 'faculty@campus.edu').trim();
    const feedback = req.body.feedback ? String(req.body.feedback).trim() : '';

    if (status === 'rejected' && !feedback) {
      res.status(400).json({ error: 'Faculty feedback is mandatory when rejecting an achievement submission.' });
      return;
    }

    const db = readDatabase();
    const targetId = String(req.params.id);
    const idx = db.achievements.findIndex((a) => a.id === targetId);

    if (idx < 0) {
      res.status(404).json({ error: `Achievement with ID "${targetId}" not found.` });
      return;
    }

    const current = db.achievements[idx];
    current.status = status;
    current.facultyFeedback = feedback;
    current.reviewedByFacultyName = facultyName;
    current.reviewedByFacultyEmail = facultyEmail;
    current.reviewedAt = new Date().toISOString();
    current.updatedAt = new Date().toISOString();

    // Calculate verified points according to category weight
    if (status === 'verified') {
      const categoryPointsMap: Record<string, number> = {
        Internships: 25,
        Hackathons: 20,
        Projects: 15,
        Certifications: 15,
        'Course Completion Certificates': 10,
        'Extracurricular Activities': 10,
        'Other Academic Achievements': 10,
      };
      current.pointsAwarded = categoryPointsMap[current.category] || 10;
    } else {
      current.pointsAwarded = 0;
    }

    db.achievements[idx] = current;
    writeDatabase(db);

    res.json({ success: true, achievement: current });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process faculty review: ' + (err.message || String(err)) });
  }
};

app.post('/api/achievements/:id/review', (req, res) => {
  handleReviewOrVerify(req, res);
});

app.post('/api/achievements/:id/verify', (req, res) => {
  handleReviewOrVerify(req, res, 'verified');
});

// AI Career Guide using Google Gemini API
app.post('/api/gemini/career-guide', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      res.status(503).json({
        error:
          'Gemini API key is not configured in environment variables. Please configure GEMINI_API_KEY in the Secrets panel.',
      });
      return;
    }

    const { student, semesters, verifiedAchievements } = req.body;

    if (!student) {
      res.status(400).json({ error: 'Student details required for career guidance.' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
You are the AI Academic & Career Guidance Advisor for CampusTrack AI, an academic growth system for college engineering & tech students.

STUDENT ACADEMIC & ACHIEVEMENT PROFILE:
- Name: ${student.fullName}
- Branch / Department: ${student.branch}
- Current Semester: ${student.currentSemester} of 8
- Self-Reported Skills: ${student.skills?.length ? student.skills.join(', ') : 'None listed yet'}
- Target Career Interests: ${student.careerInterests?.length ? student.careerInterests.join(', ') : 'Open to exploration'}
- Academic Semesters Completed: ${
      semesters?.length
        ? semesters
            .map(
              (s: any) =>
                `Sem ${s.semesterNumber}: SGPA ${s.sgpa} (${s.subjects?.length || 0} subjects)`
            )
            .join('; ')
        : 'No semester marks entered yet'
    }
- Verified Achievements & Credentials: ${
      verifiedAchievements?.length
        ? verifiedAchievements
            .map(
              (a: any) =>
                `[${a.category}] ${a.title} by ${a.organization} (Points: ${a.pointsAwarded})`
            )
            .join('; ')
        : 'No verified achievements yet'
    }

TASK:
Generate a highly personalized, practical, semester-appropriate career development roadmap for this student.
Format your output strictly as a valid JSON object matching the following structure:
{
  "targetCareerProfile": "A concise headline of the ideal career specialization for this student based on their profile",
  "skillsToImprove": [
    {
      "skill": "Specific high-demand skill name",
      "priority": "High" or "Medium" or "Low",
      "rationale": "Clear 1-2 sentence explanation of why this matters for their branch and semester",
      "recommendedLearning": "Specific framework, tool, or resource concept to focus on"
    }
  ],
  "recommendedProjects": [
    {
      "title": "Specific, non-trivial portfolio project title",
      "difficulty": "Beginner" or "Intermediate" or "Advanced",
      "description": "2-sentence practical project idea that solves a real problem",
      "techStack": ["tech1", "tech2", "tech3"],
      "whyRelevant": "Why this project stands out to campus recruiters"
    }
  ],
  "learningTopics": [
    {
      "topic": "Academic or industry topic name",
      "category": "Core CS / Practical / Cloud / AI / System Design",
      "summary": "Key concepts to master this semester"
    }
  ],
  "internshipPrep": [
    {
      "action": "Concrete preparation action item",
      "timeline": "e.g. Next 30 days, or During semester break",
      "keyAdvice": "Specific actionable tip"
    }
  ],
  "placementRoadmap": [
    {
      "milestone": "Goal / Benchmark",
      "targetSemester": "e.g. Semester 5 or Semester 6",
      "checklist": ["action item 1", "action item 2", "action item 3"]
    }
  ],
  "disclaimer": "AI recommendations are tailored for educational planning and skill acceleration and do not guarantee campus placement or employment."
}

Do not wrap in markdown quotes if possible, output pure JSON. Do not invent false experience.
`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          break; // success
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelName} returned error, attempting fallback:`, callErr?.message || callErr);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All candidate Gemini models failed to generate content.');
    }

    const rawOutput = response.text || '';
    let parsed: AICareerRoadmap;

    try {
      // Clean possible markdown code fences if present
      const cleaned = rawOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.warn('Failed to parse JSON response directly from Gemini, fallback to sanitized extract:', parseError);
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Gemini response could not be parsed into career guidance schema.');
      }
    }

    res.json({
      success: true,
      roadmap: parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini career guide error:', err);
    res.status(500).json({
      error: 'Failed to generate AI career recommendations: ' + (err.message || String(err)),
    });
  }
});

// Configure Vite middleware for dev or serve dist in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusTrack AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
