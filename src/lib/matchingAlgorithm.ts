import { UserProfile, Project, RankedProject } from '../types';

export const CAUSES = [
  'Education', 'Environment', 'Healthcare', 'Women Empowerment',
  'Rural Development', 'Child Welfare', 'Animal Welfare', 'Disaster Relief',
  'Elder Care', 'Disability Support', 'Food Security', 'Mental Health'
];

export const SKILLS = [
  'Teaching', 'Coding', 'Design', 'Photography', 'Writing',
  'Event Management', 'Social Media', 'Data Analysis', 'Medical/Health',
  'Legal Aid', 'Translation', 'Music & Arts', 'Engineering', 'Finance'
];

export const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Chandigarh',
  'Surat', 'Nagpur', 'Indore', 'Remote/Online'
];

export const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

/**
 * Rules-based matching algorithm (v1)
 *
 * Score breakdown:
 *   Cause overlap      → 40%
 *   Skill overlap      → 35%
 *   Location match     → 15%
 *   Availability fit   → 10%
 *
 * Returns 0-100 integer score.
 */
export function scoreProject(student: UserProfile, project: Project): number {
  let score = 0;

  // ── Cause overlap (40 pts) ──────────────────────────────────────────────
  const studentCauses = student.causes || [];
  const projectCauses = project.causes || [];
  if (studentCauses.length > 0 && projectCauses.length > 0) {
    const overlap = studentCauses.filter(c => projectCauses.includes(c)).length;
    const denominator = Math.max(studentCauses.length, projectCauses.length);
    score += (overlap / denominator) * 40;
  }

  // ── Skill overlap (35 pts) ──────────────────────────────────────────────
  const studentSkills = student.skills || [];
  const projectSkills = project.requiredSkills || [];
  if (studentSkills.length > 0 && projectSkills.length > 0) {
    const overlap = studentSkills.filter(s => projectSkills.includes(s)).length;
    score += (overlap / projectSkills.length) * 35;
  }

  // ── Location match (15 pts) ────────────────────────────────────────────
  if (student.location && project.location) {
    if (project.location === 'Remote/Online') {
      score += 15; // remote always accessible
    } else if (student.location.toLowerCase() === project.location.toLowerCase()) {
      score += 15;
    }
  } else {
    score += 5; // partial credit if no location data
  }

  // ── Availability fit (10 pts) ───────────────────────────────────────────
  if (student.availability && project.hoursRequired) {
    const fit = Math.min(student.availability / project.hoursRequired, 1);
    score += fit * 10;
  } else {
    score += 5; // partial credit
  }

  return Math.round(score);
}

/** Rank all projects for a student, best-match first. */
export function rankProjects(student: UserProfile, projects: Project[]): RankedProject[] {
  return projects
    .map(project => ({ project, score: scoreProject(student, project) }))
    .sort((a, b) => b.score - a.score);
}

/** Human-readable label + CSS colour class for a given score. */
export function getMatchLabel(score: number): { label: string; colorClass: string; bgClass: string } {
  if (score >= 75) return { label: 'Excellent Match', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/20 border-emerald-500/40' };
  if (score >= 50) return { label: 'Good Match',      colorClass: 'text-blue-400',    bgClass: 'bg-blue-500/20 border-blue-500/40' };
  if (score >= 25) return { label: 'Fair Match',       colorClass: 'text-amber-400',   bgClass: 'bg-amber-500/20 border-amber-500/40' };
  return              { label: 'Low Match',            colorClass: 'text-slate-400',   bgClass: 'bg-slate-500/20 border-slate-500/40' };
}
