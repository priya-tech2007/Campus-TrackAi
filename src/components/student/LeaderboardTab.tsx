import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Users,
} from 'lucide-react';
import { fetchAllStudents } from '../../services/api.ts';
import type { StudentProfile } from '../../types/index.ts';

interface LeaderboardTabProps {
  currentStudent: StudentProfile;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ currentStudent }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStudents()
      .then((data) => {
        // Sort by CGPA and verified achievements
        const sorted = [...data].sort((a, b) => {
          const scoreA = (a.cgpa || 0) * 10 + (a.verifiedAchievements || 0) * 5;
          const scoreB = (b.cgpa || 0) * 10 + (b.verifiedAchievements || 0) * 5;
          return scoreB - scoreA;
        });
        setStudents(sorted);
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Batch Academic Growth & Achievements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Peer benchmarking based on cumulative CGPA and verified technical milestones.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Privacy Protected: Roll numbers used in place of personal contact info.</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading student rankings...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No students registered yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Student rankings and peer metrics will appear here once students register their profiles.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Student Roll No</th>
                  <th className="py-3.5 px-4">Branch & Semester</th>
                  <th className="py-3.5 px-4 text-center">CGPA</th>
                  <th className="py-3.5 px-4 text-center">Verified Achievements</th>
                  <th className="py-3.5 px-4 text-right">Registered Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {students.map((std, idx) => {
                  const isCurrent = std.id === currentStudent.id;
                  const rank = idx + 1;

                  return (
                    <tr
                      key={std.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">#{rank}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {std.rollNumber}
                        </div>
                        {isCurrent && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                            (You)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="truncate max-w-[200px]">{std.branch}</div>
                        <div className="text-[10px] text-slate-400">Semester {std.currentSemester}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {std.cgpa !== null ? std.cgpa.toFixed(2) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {std.verifiedAchievements || 0} verified
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {std.skills?.length || 0} skills listed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
