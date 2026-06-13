import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import {
  collection, query, onSnapshot, addDoc, serverTimestamp,
  where, doc, updateDoc,
} from 'firebase/firestore';
import {
  Heart, Search, MapPin, Clock, LogOut, Compass, Briefcase,
  User, BarChart3, CheckCircle2, AlertCircle, Star, X, Check,
  ChevronRight, Shield, Zap, TrendingUp, Award,
} from 'lucide-react';
import { Application, Project } from '../types';
import { rankProjects, getMatchLabel, SKILLS, CAUSES, CITIES } from '../lib/matchingAlgorithm';
import FeedbackModal from './FeedbackModal';

type Tab = 'discover' | 'applications' | 'profile' | 'impact';

export default function StudentDashboard() {
  const { userProfile, logout, updateProfile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<Tab>('discover');
  const [search, setSearch] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState<Application | null>(null);

  // Profile edit state
  const [editSkills,  setEditSkills]  = useState<string[]>(userProfile?.skills  || []);
  const [editCauses,  setEditCauses]  = useState<string[]>(userProfile?.causes  || []);
  const [editLoc,     setEditLoc]     = useState(userProfile?.location     || '');
  const [editAvail,   setEditAvail]   = useState(userProfile?.availability || 5);
  const [editCollege, setEditCollege] = useState(userProfile?.college     || '');
  const [editBio,     setEditBio]     = useState(userProfile?.bio          || '');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'projects')), snap =>
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Project))
    );
    return unsub;
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    const unsub = onSnapshot(
      query(collection(db, 'applications'), where('studentId', '==', userProfile.uid)),
      snap => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Application))
    );
    return unsub;
  }, [userProfile]);

  const applyToProject = async (proj: Project) => {
    if (!userProfile || hasApplied(proj.id)) return;
    await addDoc(collection(db, 'applications'), {
      studentId: userProfile.uid,
      studentName: userProfile.name,
      projectId: proj.id,
      ngoId: proj.ngoId,
      status: 'APPLIED',
      appliedAt: serverTimestamp(),
    });
    setTab('applications');
  };

  const hasApplied = (pid: string) => applications.some(a => a.projectId === pid);

  const saveProfile = async () => {
    setSaving(true);
    await updateProfile({ skills: editSkills, causes: editCauses, location: editLoc, availability: editAvail, college: editCollege, bio: editBio });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Ranked + filtered projects
  const ranked = userProfile
    ? rankProjects(userProfile, projects).filter(({ project: p }) =>
        !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.ngoName?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Stats
  const totalHours    = applications.reduce((s, a) => s + (a.hoursLogged || 0), 0);
  const completed     = applications.filter(a => a.status === 'COMPLETED' || a.status === 'FEEDBACK_SUBMITTED').length;
  const active        = applications.filter(a => a.status === 'ACTIVE').length;
  const profileScore  = Math.round(
    ([editSkills.length > 0, editCauses.length > 0, !!editLoc, !!editCollege, !!editBio].filter(Boolean).length / 5) * 100
  );

  const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    APPLIED:            { label: 'Applied',    icon: <Clock className="w-3 h-3" />,        className: 'chip-amber'  },
    ACTIVE:             { label: 'Active',     icon: <Zap className="w-3 h-3" />,           className: 'status-active' },
    COMPLETED:          { label: 'Completed',  icon: <CheckCircle2 className="w-3 h-3" />,  className: 'chip-emerald' },
    FEEDBACK_SUBMITTED: { label: 'Reviewed',   icon: <Star className="w-3 h-3" />,          className: 'status-feedback_submitted' },
    DECLINED:           { label: 'Declined',   icon: <X className="w-3 h-3" />,             className: 'chip-rose'   },
  };

  const navItems: { id: Tab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: 'discover',     icon: <Compass className="w-5 h-5" />,   label: 'Discover',     badge: ranked.length },
    { id: 'applications', icon: <Briefcase className="w-5 h-5" />, label: 'Applications', badge: applications.length },
    { id: 'profile',      icon: <User className="w-5 h-5" />,      label: 'My Profile' },
    { id: 'impact',       icon: <BarChart3 className="w-5 h-5" />, label: 'Impact' },
  ];

  return (
    <div className="sidebar-layout bg-[#0d0d1a] min-h-screen">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <Heart className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm font-[Space_Grotesk]">VolunteerBridge</p>
              <p className="text-[10px] text-slate-500">Student Portal</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`nav-item w-full ${tab === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
              {userProfile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{userProfile?.college}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary w-full flex items-center gap-2 text-xs justify-center py-2">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-[#0d0d1a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-white font-[Space_Grotesk] capitalize">{tab === 'discover' ? 'Discover Opportunities' : tab === 'applications' ? 'My Applications' : tab === 'profile' ? 'My Profile' : 'My Impact'}</h2>
              <p className="text-xs text-slate-500">Hi {userProfile?.name?.split(' ')[0]} 👋 — {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            {tab === 'discover' && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="input-dark pl-9 py-2 text-sm"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">

          {/* ── Discover Tab ─────────────────────────────────────────────── */}
          {tab === 'discover' && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Zap className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <p className="text-sm text-violet-300">
                  Projects are ranked by your <strong>match score</strong> — based on your skills, causes, location & availability.
                </p>
              </div>

              {ranked.length === 0 && (
                <div className="text-center py-20">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No projects found</p>
                  <p className="text-slate-600 text-sm mt-1">NGOs haven't posted any opportunities yet</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {ranked.map(({ project: p, score }) => {
                  const match = getMatchLabel(score);
                  const applied = hasApplied(p.id);
                  return (
                    <div key={p.id} className="glass rounded-2xl overflow-hidden card-hover flex flex-col">
                      {/* Card header */}
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-500 font-medium mb-1 flex items-center gap-1">
                              {p.ngoName}
                              {p.ngoVerified && <Shield className="w-3 h-3 text-emerald-400" />}
                            </p>
                            <h3 className="font-bold text-white leading-snug">{p.title}</h3>
                          </div>
                          <div className={`chip text-[10px] flex-shrink-0 ${match.bgClass} ${match.colorClass}`}>
                            {score}% match
                          </div>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{p.description}</p>

                        {/* Cause chips */}
                        {p.causes?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {p.causes.slice(0, 3).map(c => (
                              <span key={c} className="chip chip-violet" style={{ fontSize: '10px', padding: '2px 8px' }}>{c}</span>
                            ))}
                          </div>
                        )}

                        {/* Skill chips */}
                        {p.requiredSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.requiredSkills.slice(0, 3).map(s => (
                              <span key={s} className="chip chip-indigo" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location || 'Anywhere'}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.hoursRequired || '—'}h/wk</span>
                          {p.durationWeeks && <span>{p.durationWeeks}w</span>}
                        </div>
                      </div>

                      {/* Apply button */}
                      <div className="px-5 pb-5">
                        <button
                          onClick={() => applyToProject(p)}
                          disabled={applied}
                          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                            applied
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'btn-primary'
                          }`}
                        >
                          {applied ? <><Check className="w-4 h-4" /> Applied</> : <>Apply Now <ChevronRight className="w-4 h-4" /></>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Applications Tab ──────────────────────────────────────────── */}
          {tab === 'applications' && (
            <div className="space-y-4 max-w-3xl">
              {applications.length === 0 && (
                <div className="text-center py-20">
                  <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No applications yet</p>
                  <p className="text-slate-600 text-sm mt-1">Go to Discover to apply to projects</p>
                  <button onClick={() => setTab('discover')} className="btn-primary mt-4 inline-flex items-center gap-2">
                    Discover Projects <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {applications.map(app => {
                const proj = projects.find(p => p.id === app.projectId);
                const cfg  = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
                const canFeedback = (app.status === 'COMPLETED') && !app.feedbackGiven;

                return (
                  <div key={app.id} className="glass rounded-2xl p-5 card-hover">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-0.5">{proj?.title || 'Project'}</h3>
                        <p className="text-sm text-slate-400">{proj?.ngoName}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          {proj?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{proj.location}</span>}
                          {proj?.hoursRequired && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{proj.hoursRequired}h/wk</span>}
                          <span>Applied {app.appliedAt?.toDate?.()?.toLocaleDateString?.('en-IN') || 'Recently'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`chip ${cfg.className} flex items-center gap-1`}>
                          {cfg.icon}{cfg.label}
                        </span>
                        {canFeedback && (
                          <button
                            onClick={() => setFeedbackTarget(app)}
                            className="text-xs flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors font-semibold"
                          >
                            <Star className="w-3 h-3" /> Rate this experience
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status timeline */}
                    <div className="mt-4 flex items-center gap-1">
                      {['APPLIED', 'ACTIVE', 'COMPLETED'].map((s, i) => {
                        const statuses = ['APPLIED', 'ACTIVE', 'COMPLETED', 'FEEDBACK_SUBMITTED'];
                        const currentIdx = statuses.indexOf(app.status);
                        const stepIdx = statuses.indexOf(s);
                        const done = currentIdx >= stepIdx && app.status !== 'DECLINED';
                        return (
                          <React.Fragment key={s}>
                            <div className={`flex items-center gap-1 text-[10px] font-semibold ${done ? 'text-violet-400' : 'text-slate-600'}`}>
                              <div className={`w-2 h-2 rounded-full ${done ? 'bg-violet-500' : 'bg-slate-700'}`} />
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </div>
                            {i < 2 && <div className={`flex-1 h-px ${done && currentIdx > stepIdx ? 'bg-violet-500/50' : 'bg-slate-700'}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Profile Tab ───────────────────────────────────────────────── */}
          {tab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              {/* Profile completeness */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">Profile Completeness</p>
                  <span className={`text-sm font-bold ${profileScore >= 80 ? 'text-emerald-400' : profileScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profileScore}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${profileScore}%`, background: profileScore >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)' : profileScore >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#f43f5e,#fb7185)' }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">Complete your profile to get better matches</p>
              </div>

              {/* Basic info */}
              <div className="glass rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white mb-2">Basic Info</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">College</label>
                  <input className="input-dark" value={editCollege} onChange={e => setEditCollege(e.target.value)} placeholder="Your college..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">City</label>
                  <select className="input-dark" value={editLoc} onChange={e => setEditLoc(e.target.value)}>
                    <option value="">Select city...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    Availability: {editAvail}h/week
                  </label>
                  <input type="range" min={1} max={20} value={editAvail} onChange={e => setEditAvail(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Bio</label>
                  <textarea className="input-dark resize-none" rows={3} value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell NGOs about yourself..." />
                </div>
              </div>

              {/* Skills */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Skills</h3>
                  <span className="chip chip-indigo">{editSkills.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(s => (
                    <button
                      key={s}
                      onClick={() => setEditSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className={`chip transition-all ${editSkills.includes(s) ? 'chip-indigo selected' : 'chip-slate'}`}
                    >
                      {editSkills.includes(s) && <Check className="w-3 h-3 mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Causes */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Causes</h3>
                  <span className="chip chip-violet">{editCauses.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CAUSES.map(c => (
                    <button
                      key={c}
                      onClick={() => setEditCauses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                      className={`chip transition-all ${editCauses.includes(c) ? 'chip-violet selected' : 'chip-slate'}`}
                    >
                      {editCauses.includes(c) && <Check className="w-3 h-3 mr-1" />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ── Impact Tab ────────────────────────────────────────────────── */}
          {tab === 'impact' && (
            <div className="max-w-3xl space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock,        label: 'Hours Volunteered', value: totalHours,            color: 'violet' },
                  { icon: CheckCircle2, label: 'Projects Completed', value: completed,             color: 'emerald' },
                  { icon: Zap,          label: 'Active Now',          value: active,               color: 'blue' },
                  { icon: Award,        label: 'NGOs Supported',      value: new Set(applications.map(a => a.ngoId)).size, color: 'amber' },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-5 card-hover">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      stat.color === 'violet' ? 'bg-violet-500/20' :
                      stat.color === 'emerald' ? 'bg-emerald-500/20' :
                      stat.color === 'blue' ? 'bg-blue-500/20' : 'bg-amber-500/20'
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === 'violet' ? 'text-violet-400' :
                        stat.color === 'emerald' ? 'text-emerald-400' :
                        stat.color === 'blue' ? 'text-blue-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <p className="text-2xl font-bold text-white font-[Space_Grotesk]">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="glass rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <h3 className="font-bold text-white">Volunteering History</h3>
                </div>
                {applications.length === 0 ? (
                  <div className="p-8 text-center">
                    <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Your impact story starts here</p>
                    <button onClick={() => setTab('discover')} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm py-2 px-4">
                      Find Projects <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <table className="table-dark">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>NGO</th>
                        <th>Status</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => {
                        const proj = projects.find(p => p.id === app.projectId);
                        const cfg  = STATUS_CONFIG[app.status] || STATUS_CONFIG.APPLIED;
                        return (
                          <tr key={app.id}>
                            <td className="text-white font-medium">{proj?.title || '—'}</td>
                            <td>{proj?.ngoName || '—'}</td>
                            <td><span className={`chip ${cfg.className}`}>{cfg.label}</span></td>
                            <td className="font-semibold">{app.hoursLogged || 0}h</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {completed > 0 && (
                <div className="glass rounded-2xl p-6 text-center border border-emerald-500/20">
                  <Award className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-bold text-white mb-1">Certificate Ready!</h3>
                  <p className="text-sm text-slate-400 mb-4">You've completed {completed} project{completed > 1 ? 's' : ''}. Download your NSS Volunteer Certificate.</p>
                  <button className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-6">
                    <Award className="w-4 h-4" /> Download Certificate (PDF)
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Feedback Modal */}
      {feedbackTarget && userProfile && (
        <FeedbackModal
          applicationId={feedbackTarget.id}
          fromId={userProfile.uid}
          toId={feedbackTarget.ngoId}
          fromRole="student"
          recipientName={projects.find(p => p.id === feedbackTarget.projectId)?.ngoName || 'NGO'}
          onClose={() => {
            updateDoc(doc(db, 'applications', feedbackTarget.id), { feedbackGiven: true, status: 'FEEDBACK_SUBMITTED' });
            setFeedbackTarget(null);
          }}
        />
      )}
    </div>
  );
}
