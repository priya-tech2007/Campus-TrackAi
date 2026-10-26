import React from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import type { StudentProfile, FacultyProfile, SystemStatus } from '../types/index.ts';

interface NavbarProps {
  currentStudent: StudentProfile | null;
  currentFaculty: FacultyProfile | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  systemStatus: SystemStatus | null;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  currentFaculty,
  onLogout,
  isDarkMode,
  onToggleTheme,
  systemStatus,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg">
                CampusTrack
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
              Student Growth & Achievement System
            </p>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User badge or guest */}
          {currentStudent && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {currentStudent.fullName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {currentStudent.rollNumber} • Sem {currentStudent.currentSemester}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                {currentStudent.fullName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                title="Switch Profile / Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentFaculty && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {currentFaculty.fullName}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Faculty Reviewer
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                {currentFaculty.fullName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                title="Sign Out Faculty"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
