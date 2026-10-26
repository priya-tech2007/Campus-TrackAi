import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Award,
  UploadCloud,
  Sparkles,
  User,
  Trophy,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import type {
  StudentProfile,
  SemesterRecord,
  AchievementSubmission,
} from '../../types/index.ts';
import { calculatePerformanceScore } from '../../utils/scoreCalculator.ts';
import { OverviewTab } from './OverviewTab.tsx';
import { AcademicGrowthTab } from './AcademicGrowthTab.tsx';
import { AchievementsTab } from './AchievementsTab.tsx';
import { UploadAchievementTab } from './UploadAchievementTab.tsx';
import { AICareerGuideTab } from './AICareerGuideTab.tsx';
import { ProfileTab } from './ProfileTab.tsx';
import { LeaderboardTab } from './LeaderboardTab.tsx';

interface StudentDashboardProps {
  student: StudentProfile;
  semesters: SemesterRecord[];
  achievements: AchievementSubmission[];
  onUpdateStudent: (updated: StudentProfile) => void;
  onSaveSemester: (record: SemesterRecord) => void;
  onAddAchievement: (achievement: AchievementSubmission) => void;
  onUpdateAchievement: (achievement: AchievementSubmission) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  semesters,
  achievements,
  onUpdateStudent,
  onSaveSemester,
  onAddAchievement,
  onUpdateAchievement,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSemesterModal, setActiveSemesterModal] = useState<number | null>(null);

  // Recalculate score live based on current state
  const score = calculatePerformanceScore(student, semesters, achievements);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academic-growth', label: 'Academic Growth', icon: TrendingUp },
    {
      id: 'my-achievements',
      label: 'My Achievements',
      icon: Award,
      badge: achievements.length > 0 ? achievements.length : undefined,
    },
    { id: 'upload-achievement', label: 'Upload Achievement', icon: UploadCloud },
    { id: 'ai-career-guide', label: 'AI Career Guide', icon: Sparkles, highlight: true },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'my-profile', label: 'My Profile', icon: User },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-4 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-sm text-slate-800 dark:text-white capitalize">
            {navigationItems.find((n) => n.id === activeTab)?.label}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation (3 cols) */}
        <aside
          className={`lg:col-span-3 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-6 ${
            isMobileMenuOpen ? 'block mb-4' : 'hidden lg:block'
          }`}
        >
          {/* Quick Profile Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {student.fullName}
            </div>
            <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {student.rollNumber}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
              {student.branch} • Sem {student.currentSemester}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Score</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                {score.overallScore}/100
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-left">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : item.highlight
                      ? 'text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area (9 cols) */}
        <main className="lg:col-span-9 w-full">
          {activeTab === 'dashboard' && (
            <OverviewTab
              student={student}
              semesters={semesters}
              achievements={achievements}
              score={score}
              onNavigateTab={handleTabChange}
              onOpenSemesterModal={(semNum) => setActiveSemesterModal(semNum)}
            />
          )}

          {activeTab === 'academic-growth' && (
            <AcademicGrowthTab
              student={student}
              semesters={semesters}
              onSaveSemester={onSaveSemester}
              activeSemesterModal={activeSemesterModal}
              onCloseSemesterModal={() => setActiveSemesterModal(null)}
              onOpenSemesterModal={(semNum) => setActiveSemesterModal(semNum)}
            />
          )}

          {activeTab === 'my-achievements' && (
            <AchievementsTab
              student={student}
              achievements={achievements}
              onNavigateTab={handleTabChange}
              onAchievementUpdated={onUpdateAchievement}
            />
          )}

          {activeTab === 'upload-achievement' && (
            <UploadAchievementTab
              student={student}
              onSuccess={(newAch) => {
                onAddAchievement(newAch);
                setActiveTab('my-achievements');
              }}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'ai-career-guide' && (
            <AICareerGuideTab
              student={student}
              semesters={semesters}
              achievements={achievements}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'my-profile' && (
            <ProfileTab
              student={student}
              onProfileUpdated={onUpdateStudent}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab currentStudent={student} />
          )}
        </main>
      </div>
    </div>
  );
};
