import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '../AuthContext';
import { db } from '../firebase';
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp,
  doc, updateDoc,
} from 'firebase/firestore';
import {
  Heart, Building2, PlusCircle, X, ChevronRight, LogOut,
  Briefcase, BarChart3, Users, Check, Loader2, MapPin,
  Clock, AlertCircle, Zap, CheckCircle2, Star, Shield,
} from 'lucide-react';
import { Application, Project } from '../types';
import { CAUSES, SKILLS, CITIES } from '../lib/matchingAlgorithm';
import FeedbackModal from './FeedbackModal';

type Tab = 'projects' | 'applications' | 'analytics';

export default function NGODashboard() {
  const { userProfile, logout } = useAuth();
  const [projects,       setProjects]       = useState<Project[]>([]);
  const [applications,   setApplications]   = useState<Application[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, UserProfile>>({});
  const [tab,             setTab]            = useState<Tab>('projects');
  const [showCreate,      setShowCreate]     = useState(false);
  const [feedbackTarget,  setFeedbackTarget] = useState<Application | null>(null);

  // Create project form
  const [title,    setTitle]    = useState('');
  const [desc,     setDesc]     = useState('');
  const [location, setLocation] = useState('');
  const [hours,    setHours]    = useState(5);
  const [weeks,    setWeeks]    = useState(4);
  const [pCauses,  setPCauses]  = useState<string[]>([]);
  const [pSkills,  setPSkills]  = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    const unsub1 = onSnapshot(
      query(collection(db, 'projects'), where('ngoId', '==', userProfile.uid)),
      snap => setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Project))
    );
    const unsub2 = onSnapshot(
      query(collection(db, 'applications'), where('ngoId', '==', userProfile.uid)),
      snap => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Application))
    );
    const unsub3 = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'student')),
      snap => {
        const map: Record<string, UserProfile> = {};
        snap.forEach(d => { map[d.id] = d.data() as UserProfile; });
        setStudentProfiles(map);
      }
    );
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [userProfile]);

  const createProject = async () => {
    if (!userProfile || !title.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ngoId: userProfile.uid,
        ngoName: userProfile.name,
        ngoVerified: userProfile.verificationStatus === 'VERIFIED',
        title: title.trim(),
        description: desc,
        causes: pCauses,
        requiredSkills: pSkills,
        location,
        hoursRequired: hours,
        durationWeeks: weeks,
        isVerified: false,
        createdAt: serverTimestamp(),
      });
      setTitle(''); setDesc(''); setLocation(''); setPCauses([]); setPSkills([]);
      setHours(5); setWeeks(4);
      setShowCreate(false);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    await updateDoc(doc(db, 'applications', appId), { status, updatedAt: serverTimestamp() });
  };

  const markComplete = async (appId: string) => {
    await updateDoc(doc(db, 'applications', appId), { status: 'COMPLETED', updatedAt: serverTimestamp() });
  };

  const totalApplicants = applications.length;
  const activeVols      = applications.filter(a => a.status === 'ACTIVE').length;
  const completedVols   = applications.filter(a => ['COMPLETED', 'FEEDBACK_SUBMITTED'].includes(a.status)).length;
  const totalHours      = applications.reduce((s, a) => s + (a.hoursLogged || 0), 0);

  const isVerified = userProfile?.verificationStatus === 'VERIFIED';
  const isPending  = userProfile?.verificationStatus === 'PENDING';

  const STATUS_COLORS: Record<string, string> = {
    APPLIED: 'chip-amber', ACTIVE: 'status-active', COMPLETED: 'chip-emerald',
    DECLINED: 'chip-rose', FEEDBACK_SUBMITTED: 'status-feedback_submitted',
  };

  const navItems = [
    { id: 'projects'     as Tab, icon: <Briefcase className="w-5 h-5" />, label: 'My Projects',   badge: projects.length },
    { id: 'applications' as Tab, icon: <Users className="w-5 h-5" />,     label: 'Applications',  badge: applications.filter(a => a.status === 'APPLIED').length },
    { id: 'analytics'   as Tab, icon: <BarChart3 className="w-5 h-5" />,  label: 'Analytics' },
  ];

  return (
    <div className="sidebar-layout bg-[#0d0d1a] min-h-screen">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center flex-shrink-0">
              <Heart className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm font-[Space_Grotesk]">VolunteerBridge</p>
              <p className="text-[10px] text-slate-500">NGO Partner Portal</p>
            </div>
          </div>

          {/* Verification badge */}
          <div className={`mb-6 p-3 rounded-xl border ${isVerified ? 'bg-emerald-500/10 border-emerald-500/20' : isPending ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${isVerified ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-rose-400'}`} />
              <span className={`text-xs font-semibold ${isVerified ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-rose-400'}`}>
                {isVerified ? 'Verified NGO' : isPending ? 'Verification Pending' : 'Not Verified'}
              </span>
            </div>
            {!isVerified && <p className="text-[10px] text-slate-500 mt-1">NSS coordinator will review your Darpan ID</p>}
          </div>

          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`nav-item w-full ${tab === item.id ? 'active' : ''}`}>
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-500/30">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-rose-600 flex items-center justify-center text-white text-sm font-bold">
              {userProfile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{userProfile?.darpanId || 'NGO Partner'}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary w-full flex items-center gap-2 text-xs justify-center py-2">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="main-content">
        <div className="sticky top-0 z-30 bg-[#0d0d1a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-white font-[Space_Grotesk]">
              {tab === 'projects' ? 'My Projects' : tab === 'applications' ? 'Volunteer Applications' : 'Impact Analytics'}
            </h2>
            <p className="text-xs text-slate-500">Welcome back, {userProfile?.name?.split(' ')[0]}</p>
          </div>
          {tab === 'projects' && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
              <PlusCircle className="w-4 h-4" /> New Project
            </button>
          )}
        </div>

        <div className="p-6">

          {/* ── Projects Tab ─────────────────────────────────────────────── */}
          {tab === 'projects' && (
            <div>
              {!isVerified && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Verification Pending</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">Your NGO is pending verification. Your projects will be visible but marked as unverified. NSS coordinators will review your Darpan ID: <strong>{userProfile?.darpanId}</strong></p>
                  </div>
                </div>
              )}

              {projects.length === 0 && (
                <div className="text-center py-20">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No projects yet</p>
                  <p className="text-slate-600 text-sm mt-1">Create your first volunteer opportunity</p>
                  <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Create Project
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projects.map(proj => {
                  const projApps = applications.filter(a => a.projectId === proj.id);
                  return (
                    <div key={proj.id} className="glass rounded-2xl overflow-hidden card-hover">
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="font-bold text-white">{proj.title}</h3>
                          {proj.ngoVerified && <span className="chip chip-emerald" style={{ fontSize: '10px' }}><Shield className="w-3 h-3 mr-1" />Verified</span>}
                        </div>
                        <p className="text-slate-400 text-xs mb-4 line-clamp-2">{proj.description}</p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {proj.causes?.slice(0, 3).map(c => <span key={c} className="chip chip-violet" style={{ fontSize: '10px', padding: '2px 8px' }}>{c}</span>)}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {proj.requiredSkills?.slice(0, 3).map(s => <span key={s} className="chip chip-indigo" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>)}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {proj.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{proj.location}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{proj.hoursRequired}h/wk</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{projApps.length} applicants</span>
                        </div>
                      </div>

                      {/* Applications inline */}
                      {projApps.length > 0 && (
                        <div className="border-t border-white/5 p-4 space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Applications</p>
                          {projApps.slice(0, 4).map(app => {
                            const student = studentProfiles[app.studentId];
                            return (
                              <div key={app.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                                    {(student?.name || 'S')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-white">{student?.name || 'Loading...'}</p>
                                    <p className="text-[10px] text-slate-500">{student?.college || ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`chip ${STATUS_COLORS[app.status] || 'chip-slate'}`} style={{ fontSize: '10px' }}>
                                    {app.status.charAt(0) + app.status.slice(1).toLowerCase().replace('_', ' ')}
                                  </span>
                                  {app.status === 'APPLIED' && (
                                    <>
                                      <button onClick={() => updateStatus(app.id, 'ACTIVE')} className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded font-semibold hover:bg-emerald-500/25 transition-colors">✓</button>
                                      <button onClick={() => updateStatus(app.id, 'DECLINED')} className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-1 rounded font-semibold hover:bg-rose-500/25 transition-colors">✕</button>
                                    </>
                                  )}
                                  {app.status === 'ACTIVE' && (
                                    <button onClick={() => markComplete(app.id)} className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-1 rounded font-semibold hover:bg-blue-500/25 transition-colors">Mark Done</button>
                                  )}
                                  {app.status === 'COMPLETED' && !app.feedbackGiven && (
                                    <button onClick={() => setFeedbackTarget(app)} className="text-[10px] text-violet-400 border border-violet-500/30 px-2 py-1 rounded font-semibold hover:bg-violet-500/10 transition-colors">
                                      <Star className="w-3 h-3 inline mr-0.5" />Rate
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {projApps.length > 4 && <p className="text-[10px] text-slate-500 text-center">+{projApps.length - 4} more</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Applications Tab ──────────────────────────────────────────── */}
          {tab === 'applications' && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">All Volunteer Applications</h3>
                <div className="flex gap-2 text-xs">
                  <span className="chip chip-amber">{applications.filter(a => a.status === 'APPLIED').length} Pending</span>
                  <span className="chip chip-emerald">{activeVols} Active</span>
                </div>
              </div>
              {applications.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No applications received yet</p>
                </div>
              ) : (
                <table className="table-dark">
                  <thead>
                    <tr><th>Student</th><th>Project</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {applications.map(app => {
                      const student = studentProfiles[app.studentId];
                      const proj    = projects.find(p => p.id === app.projectId);
                      return (
                        <tr key={app.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                                {(student?.name || 'S')[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">{student?.name || '—'}</p>
                                <p className="text-[11px] text-slate-500">{student?.college}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-sm">{proj?.title || '—'}</td>
                          <td className="text-xs text-slate-500">{app.appliedAt?.toDate?.()?.toLocaleDateString?.('en-IN') || 'Recently'}</td>
                          <td><span className={`chip ${STATUS_COLORS[app.status] || 'chip-slate'}`} style={{ fontSize: '11px' }}>{app.status.replace('_', ' ')}</span></td>
                          <td>
                            <div className="flex gap-1">
                              {app.status === 'APPLIED' && (
                                <>
                                  <button onClick={() => updateStatus(app.id, 'ACTIVE')} className="text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-500/25 transition-colors">Accept</button>
                                  <button onClick={() => updateStatus(app.id, 'DECLINED')} className="text-[11px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-rose-500/25 transition-colors">Decline</button>
                                </>
                              )}
                              {app.status === 'ACTIVE' && (
                                <button onClick={() => markComplete(app.id)} className="text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-blue-500/25 transition-colors">Mark Complete</button>
                              )}
                              {app.status === 'COMPLETED' && !app.feedbackGiven && (
                                <button onClick={() => setFeedbackTarget(app)} className="text-[11px] text-violet-400 border border-violet-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-violet-500/10 transition-colors">
                                  <Star className="w-3 h-3 inline mr-0.5" />Rate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Analytics Tab ─────────────────────────────────────────────── */}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Projects',    value: projects.length,  icon: Briefcase,   color: 'violet' },
                  { label: 'Total Applicants',  value: totalApplicants,  icon: Users,        color: 'blue' },
                  { label: 'Active Volunteers', value: activeVols,       icon: Zap,          color: 'emerald' },
                  { label: 'Completed',         value: completedVols,    icon: CheckCircle2, color: 'amber' },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-5 card-hover">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      s.color === 'violet' ? 'bg-violet-500/20' : s.color === 'blue' ? 'bg-blue-500/20' :
                      s.color === 'emerald' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    }`}>
                      <s.icon className={`w-5 h-5 ${
                        s.color === 'violet' ? 'text-violet-400' : s.color === 'blue' ? 'text-blue-400' :
                        s.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <p className="text-2xl font-bold text-white font-[Space_Grotesk]">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="font-bold text-white mb-4">Projects Performance</h3>
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">No projects yet</p>
                ) : (
                  <div className="space-y-4">
                    {projects.map(proj => {
                      const projApps = applications.filter(a => a.projectId === proj.id);
                      const accepted = projApps.filter(a => ['ACTIVE','COMPLETED','FEEDBACK_SUBMITTED'].includes(a.status)).length;
                      const acceptRate = projApps.length > 0 ? Math.round((accepted / projApps.length) * 100) : 0;
                      return (
                        <div key={proj.id} className="p-4 rounded-xl bg-white/3 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-white text-sm">{proj.title}</p>
                            <span className="text-xs text-slate-400">{projApps.length} applicants</span>
                          </div>
                          <div className="progress-track mb-1">
                            <div className="progress-fill" style={{ width: `${acceptRate}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500">{acceptRate}% acceptance rate</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Create Project Modal ──────────────────────────────────────────── */}
      {showCreate && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal-card max-w-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-[Space_Grotesk]">Create Volunteer Opportunity</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-300 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Project Title *</label>
                <input className="input-dark" placeholder="e.g. Coastal Cleanup Drive" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Description *</label>
                <textarea className="input-dark resize-none" rows={3} placeholder="Describe what volunteers will do, impact they'll create..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Location</label>
                  <select className="input-dark" value={location} onChange={e => setLocation(e.target.value)}>
                    <option value="">Select city...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Hours/Week</label>
                  <input type="number" className="input-dark" min={1} max={40} value={hours} onChange={e => setHours(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Duration (weeks)</label>
                <input type="number" className="input-dark" min={1} max={52} value={weeks} onChange={e => setWeeks(Number(e.target.value))} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Cause Areas</label>
                <div className="flex flex-wrap gap-1.5">
                  {CAUSES.map(c => (
                    <button key={c} onClick={() => setPCauses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                      className={`chip transition-all ${pCauses.includes(c) ? 'chip-violet selected' : 'chip-slate'}`}>
                      {pCauses.includes(c) && <Check className="w-3 h-3 mr-1" />}{c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Required Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS.map(s => (
                    <button key={s} onClick={() => setPSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                      className={`chip transition-all ${pSkills.includes(s) ? 'chip-indigo selected' : 'chip-slate'}`}>
                      {pSkills.includes(s) && <Check className="w-3 h-3 mr-1" />}{s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={createProject} disabled={!title.trim() || creating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {creating ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackTarget && userProfile && (
        <FeedbackModal
          applicationId={feedbackTarget.id}
          fromId={userProfile.uid}
          toId={feedbackTarget.studentId}
          fromRole="ngo"
          recipientName={studentProfiles[feedbackTarget.studentId]?.name || 'Volunteer'}
          onClose={() => {
            updateDoc(doc(db, 'applications', feedbackTarget.id), { feedbackGiven: true });
            setFeedbackTarget(null);
          }}
        />
      )}
    </div>
  );
}
