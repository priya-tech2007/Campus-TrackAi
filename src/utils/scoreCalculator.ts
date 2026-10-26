import type {
  SemesterRecord,
  AchievementSubmission,
  StudentProfile,
  PerformanceScoreBreakdown,
} from '../types/index.ts';

export function calculatePerformanceScore(
  student: StudentProfile | null,
  semesters: SemesterRecord[],
  achievements: AchievementSubmission[]
): PerformanceScoreBreakdown {
  if (!student) {
    return {
      overallScore: 0,
      academicComponent: 0,
      verifiedAchievementComponent: 0,
      skillComponent: 0,
      isProvisional: true,
      cgpa: null,
      totalSubmissions: 0,
      verifiedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      explanation: 'No student profile selected.',
    };
  }

  // 1. Calculate Academic Performance (50% weight)
  // SGPA is 0 to 10. CGPA = average of entered semesters with SGPA > 0.
  const validSemesters = semesters.filter((s) => s.sgpa > 0);
  let cgpa: number | null = null;
  let rawAcademicNormalized = 0; // 0 to 100
  let isAcademicMissing = validSemesters.length === 0;

  if (validSemesters.length > 0) {
    const sumSgpa = validSemesters.reduce((acc, s) => acc + s.sgpa, 0);
    cgpa = Number((sumSgpa / validSemesters.length).toFixed(2));
    // Scale 10-point CGPA to 0-100 scale: (CGPA / 10) * 100
    rawAcademicNormalized = Math.min(100, Math.max(0, (cgpa / 10) * 100));
  }

  const academicComponent = (rawAcademicNormalized * 0.50);

  // 2. Calculate Verified Achievements (30% weight)
  // Only verified achievements contribute! Pending or rejected award 0.
  const totalSubmissions = achievements.length;
  const verifiedList = achievements.filter((a) => a.status === 'verified');
  const pendingCount = achievements.filter((a) => a.status === 'pending').length;
  const rejectedCount = achievements.filter((a) => a.status === 'rejected').length;
  const verifiedCount = verifiedList.length;

  // Each verified achievement has points:
  // Internships (25), Hackathons (20), Projects (15), Certifications (15), Courses (10), Extracurricular (10)
  // Target benchmark for 100% in achievements component is ~60 points
  const totalVerifiedPoints = verifiedList.reduce((acc, curr) => acc + (curr.pointsAwarded || 10), 0);
  const rawAchievementNormalized = Math.min(100, (totalVerifiedPoints / 60) * 100);
  const verifiedAchievementComponent = (rawAchievementNormalized * 0.30);

  // 3. Calculate Skills & Learning Activities (20% weight)
  // Based on self-reported technical skills, target career interests, and courses/certifications
  const skillCount = (student.skills?.length || 0);
  const interestCount = (student.careerInterests?.length || 0);
  // Benchmark: 5 technical skills + 2 career focus areas + any certified courses = 100%
  const skillScoreRaw = Math.min(100, (skillCount * 14) + (interestCount * 8) + (verifiedList.length * 5));
  const skillComponent = (skillScoreRaw * 0.20);

  // Overall combined score out of 100
  const overallScore = Math.round(academicComponent + verifiedAchievementComponent + skillComponent);

  // Incomplete / Provisional check:
  // If no semester records entered, or if zero achievements verified yet, label as provisional
  const isProvisional = isAcademicMissing || (totalSubmissions > 0 && verifiedCount === 0);

  let explanation = '';
  if (isAcademicMissing) {
    explanation = 'Provisional score: Semester academic grades have not been entered yet. Add semester marks in Academic Growth to calculate exact CGPA weight.';
  } else if (totalSubmissions > 0 && verifiedCount === 0) {
    explanation = `Provisional score: You have ${pendingCount} pending submission(s) undergoing faculty review. Points will be awarded once verified.`;
  } else {
    explanation = `Formula: (Academic CGPA / 10 × 50%) + (Verified Achievement Points × 30%) + (Skills & Growth × 20%). Scaled fairly out of 100 points.`;
  }

  return {
    overallScore,
    academicComponent: Number(academicComponent.toFixed(1)),
    verifiedAchievementComponent: Number(verifiedAchievementComponent.toFixed(1)),
    skillComponent: Number(skillComponent.toFixed(1)),
    isProvisional,
    cgpa,
    totalSubmissions,
    verifiedCount,
    pendingCount,
    rejectedCount,
    explanation,
  };
}
