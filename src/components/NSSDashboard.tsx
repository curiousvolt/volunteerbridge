import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ShieldCheck, Building2, Users, Activity, LogOut, BarChart3,
  CheckCircle2, XCircle, Clock, AlertCircle, Shield, Zap,
  TrendingUp, Award, Globe,
} from 'lucide-react';
import { UserProfile, Application } from '../types';

type Tab = 'overview' | 'ngos' | 'volunteers' | 'engagements';

export default function NSSDashboard() {
  const { userProfile, logout } = useAuth();
  const [ngos,         setNgos]         = useState<UserProfile[]>([]);
  const [students,     setStudents]      = useState<UserProfile[]>([]);
  const [applications, setApplications]  = useState<Application[]>([]);
  const [tab,          setTab]           = useState<Tab>('overview');

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'users'), where('role', '==', 'ngo')),
      snap => setNgos(snap.docs.map(d => ({ uid: d.id, ...d.data() }) as UserProfile)));
    const u2 = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')),
      snap => setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() }) as UserProfile)));
    const u3 = onSnapshot(query(collection(db, 'applications')),
      snap => setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Application)));
    return () => { u1(); u2(); u3(); };
  }, []);

  const verifyNGO  = async (uid: string) => await updateDoc(doc(db, 'users', uid), { verificationStatus: 'VERIFIED',  updatedAt: serverTimestamp() });
  const rejectNGO  = async (uid: string) => await updateDoc(doc(db, 'users', uid), { verificationStatus: 'REJECTED',  updatedAt: serverTimestamp() });

  const verified      = ngos.filter(n => n.verificationStatus === 'VERIFIED').length;
  const pending       = ngos.filter(n => n.verificationStatus === 'PENDING').length;
  const rejected      = ngos.filter(n => n.verificationStatus === 'REJECTED').length;
  const activeApps    = applications.filter(a => a.status === 'ACTIVE').length;
  const completedApps = applications.filter(a => ['COMPLETED', 'FEEDBACK_SUBMITTED'].includes(a.status)).length;
  const appliedApps   = applications.filter(a => a.status === 'APPLIED').length;
  const totalHours    = applications.reduce((s, a) => s + (a.hoursLogged || 0), 0);

  const STATUS_COLORS: Record<string, string> = {
    VERIFIED: 'chip-emerald', PENDING: 'chip-amber', REJECTED: 'chip-rose', UNSUBMITTED: 'chip-slate',
  };

  const APP_COLORS: Record<string, string> = {
    APPLIED: 'chip-amber', ACTIVE: 'status-active', COMPLETED: 'chip-emerald',
    DECLINED: 'chip-rose', FEEDBACK_SUBMITTED: 'status-feedback_submitted',
  };

  const navItems = [
    { id: 'overview'     as Tab, icon: <BarChart3 className="w-5 h-5" />,    label: 'Overview' },
    { id: 'ngos'         as Tab, icon: <Building2 className="w-5 h-5" />,    label: 'NGO Registry',    badge: pending > 0 ? pending : undefined },
    { id: 'volunteers'   as Tab, icon: <Users className="w-5 h-5" />,        label: 'Volunteers' },
    { id: 'engagements'  as Tab, icon: <Activity className="w-5 h-5" />,     label: 'Engagements' },
  ];

  return (
    <div className="sidebar-layout min-h-screen" style={{ background: '#080d12' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar" style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(16,185,129,0.1)' }}>
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              <ShieldCheck className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm font-[Space_Grotesk]">VolunteerBridge</p>
              <p className="text-[10px] text-emerald-500">NSS Command Center</p>
            </div>
          </div>

          {/* Pending alert */}
          {pending > 0 && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300"><strong>{pending}</strong> NGO{pending > 1 ? 's' : ''} awaiting verification</p>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`nav-item w-full ${tab === item.id ? 'active' : ''}`} style={tab === item.id ? { background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' } : {}}>
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-auto text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-5 border-t border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
              {userProfile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile?.name}</p>
              <p className="text-[11px] text-emerald-500/70">NSS Coordinator</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary w-full flex items-center gap-2 text-xs justify-center py-2">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="main-content" style={{ background: '#080d12' }}>
        <div className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/5 px-6 py-4" style={{ background: 'rgba(8,13,18,0.85)' }}>
          <div>
            <h2 className="font-bold text-white font-[Space_Grotesk]">
              {tab === 'overview' ? 'Platform Overview' : tab === 'ngos' ? 'NGO Registry & Verification' : tab === 'volunteers' ? 'Volunteer Registry' : 'Active Engagements'}
            </h2>
            <p className="text-xs text-emerald-600">NSS Admin Dashboard</p>
          </div>
        </div>

        <div className="p-6">

          {/* ── Overview Tab ─────────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* KPI grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Building2,    label: 'Registered NGOs',    value: ngos.length,     sub: `${verified} verified`,   color: 'emerald' },
                  { icon: Users,        label: 'Student Volunteers',  value: students.length, sub: `${students.filter(s => s.skills?.length).length} profile complete`, color: 'blue' },
                  { icon: Zap,          label: 'Active Engagements',  value: activeApps,      sub: `${appliedApps} pending review`, color: 'violet' },
                  { icon: CheckCircle2, label: 'Completed Projects',  value: completedApps,   sub: `${totalHours}h logged`,  color: 'amber' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      s.color === 'emerald' ? 'bg-emerald-500/15' : s.color === 'blue' ? 'bg-blue-500/15' :
                      s.color === 'violet' ? 'bg-violet-500/15' : 'bg-amber-500/15'
                    }`}>
                      <s.icon className={`w-5 h-5 ${
                        s.color === 'emerald' ? 'text-emerald-400' : s.color === 'blue' ? 'text-blue-400' :
                        s.color === 'violet' ? 'text-violet-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <p className="text-3xl font-bold text-white font-[Space_Grotesk]">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* NGO verification summary */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white">NGO Verification Breakdown</h3>
                  <button onClick={() => setTab('ngos')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">View all →</button>
                </div>
                <div className="p-5 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Verified',  value: verified, color: 'emerald' },
                    { label: 'Pending',   value: pending,  color: 'amber' },
                    { label: 'Rejected',  value: rejected, color: 'rose' },
                  ].map((s, i) => (
                    <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <p className={`text-3xl font-bold font-[Space_Grotesk] ${s.color === 'emerald' ? 'text-emerald-400' : s.color === 'amber' ? 'text-amber-400' : 'text-rose-400'}`}>{s.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="px-5 pb-5">
                  <div className="h-3 rounded-full overflow-hidden flex gap-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {ngos.length > 0 && (
                      <>
                        <div className="bg-emerald-500/70 rounded-l-full transition-all" style={{ width: `${(verified/ngos.length)*100}%` }} />
                        <div className="bg-amber-500/70 transition-all" style={{ width: `${(pending/ngos.length)*100}%` }} />
                        <div className="bg-rose-500/70 rounded-r-full transition-all" style={{ width: `${(rejected/ngos.length)*100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                    <span>Verified {ngos.length > 0 ? Math.round((verified/ngos.length)*100) : 0}%</span>
                    <span>Pending {ngos.length > 0 ? Math.round((pending/ngos.length)*100) : 0}%</span>
                    <span>Rejected {ngos.length > 0 ? Math.round((rejected/ngos.length)*100) : 0}%</span>
                  </div>
                </div>
              </div>

              {/* Recent pending NGOs */}
              {pending > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="p-5 border-b border-amber-500/10 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-amber-300">Action Required: Pending Verifications</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {ngos.filter(n => n.verificationStatus === 'PENDING').slice(0, 3).map(ngo => (
                      <div key={ngo.uid} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div>
                          <p className="text-sm font-semibold text-white">{ngo.name}</p>
                          <p className="text-xs text-slate-500">Darpan: {ngo.darpanId || 'Not provided'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => verifyNGO(ngo.uid)} className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-500/25 transition-colors flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verify
                          </button>
                          <button onClick={() => rejectNGO(ngo.uid)} className="text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold hover:bg-rose-500/25 transition-colors flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── NGOs Tab ─────────────────────────────────────────────────── */}
          {tab === 'ngos' && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">All Registered NGOs</h3>
                <div className="flex gap-2 text-xs">
                  <span className="chip chip-emerald">{verified} Verified</span>
                  <span className="chip chip-amber">{pending} Pending</span>
                </div>
              </div>
              {ngos.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No NGOs registered yet</p>
                </div>
              ) : (
                <table className="table-dark">
                  <thead>
                    <tr><th>NGO Name</th><th>Email</th><th>Darpan ID</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {ngos.map(ngo => (
                      <tr key={ngo.uid}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
                              {ngo.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-white font-semibold">{ngo.name}</span>
                          </div>
                        </td>
                        <td className="text-xs">{ngo.email}</td>
                        <td className="font-mono text-xs text-slate-400">{ngo.darpanId || <span className="text-rose-400">Not provided</span>}</td>
                        <td>
                          <span className={`chip ${STATUS_COLORS[ngo.verificationStatus || 'UNSUBMITTED']}`} style={{ fontSize: '11px' }}>
                            {ngo.verificationStatus === 'VERIFIED' && <Shield className="w-3 h-3 mr-1" />}
                            {ngo.verificationStatus || 'UNSUBMITTED'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            {ngo.verificationStatus === 'PENDING' && (
                              <>
                                <button onClick={() => verifyNGO(ngo.uid)} className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-500/25 transition-colors">Verify</button>
                                <button onClick={() => rejectNGO(ngo.uid)} className="text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-semibold hover:bg-rose-500/25 transition-colors">Reject</button>
                              </>
                            )}
                            {ngo.verificationStatus === 'VERIFIED' && (
                              <button onClick={() => rejectNGO(ngo.uid)} className="text-xs text-rose-400/60 hover:text-rose-400 transition-colors font-semibold">Revoke</button>
                            )}
                            {ngo.verificationStatus === 'REJECTED' && (
                              <button onClick={() => verifyNGO(ngo.uid)} className="text-xs text-emerald-400/60 hover:text-emerald-400 transition-colors font-semibold">Re-verify</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Volunteers Tab ────────────────────────────────────────────── */}
          {tab === 'volunteers' && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white">All Registered Volunteers</h3>
                <span className="chip chip-indigo">{students.length} students</span>
              </div>
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No student volunteers yet</p>
                </div>
              ) : (
                <table className="table-dark">
                  <thead>
                    <tr><th>Name</th><th>College</th><th>Location</th><th>Skills</th><th>Applications</th></tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const appCount = applications.filter(a => a.studentId === s.uid).length;
                      return (
                        <tr key={s.uid}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                                {s.name?.[0]?.toUpperCase()}
                              </div>
                              <span className="text-white font-semibold text-sm">{s.name}</span>
                            </div>
                          </td>
                          <td className="text-sm">{s.college || <span className="text-slate-600">—</span>}</td>
                          <td className="text-sm">{s.location || <span className="text-slate-600">—</span>}</td>
                          <td>
                            <div className="flex flex-wrap gap-1">
                              {s.skills?.slice(0, 2).map(sk => <span key={sk} className="chip chip-indigo" style={{ fontSize: '10px', padding: '1px 6px' }}>{sk}</span>)}
                              {(s.skills?.length || 0) > 2 && <span className="chip chip-slate" style={{ fontSize: '10px', padding: '1px 6px' }}>+{(s.skills?.length || 0) - 2}</span>}
                              {!s.skills?.length && <span className="text-slate-600 text-xs">—</span>}
                            </div>
                          </td>
                          <td>
                            <span className="text-white font-semibold">{appCount}</span>
                            <span className="text-slate-500 text-xs ml-1">applied</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Engagements Tab ───────────────────────────────────────────── */}
          {tab === 'engagements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Applications', value: applications.length,   color: 'violet', icon: Activity },
                  { label: 'Pending Review',     value: appliedApps,           color: 'amber',  icon: Clock },
                  { label: 'Active Now',         value: activeApps,            color: 'blue',   icon: Zap },
                  { label: 'Completed',          value: completedApps,         color: 'emerald',icon: CheckCircle2 },
                  { label: 'Declined',           value: applications.filter(a => a.status === 'DECLINED').length, color: 'rose', icon: XCircle },
                  { label: 'Hours Logged',       value: totalHours,            color: 'amber',  icon: TrendingUp },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl p-5 card-hover" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                      s.color === 'violet' ? 'bg-violet-500/15' : s.color === 'amber' ? 'bg-amber-500/15' :
                      s.color === 'blue' ? 'bg-blue-500/15' : s.color === 'emerald' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                    }`}>
                      <s.icon className={`w-4 h-4 ${
                        s.color === 'violet' ? 'text-violet-400' : s.color === 'amber' ? 'text-amber-400' :
                        s.color === 'blue' ? 'text-blue-400' : s.color === 'emerald' ? 'text-emerald-400' : 'text-rose-400'
                      }`} />
                    </div>
                    <p className="text-2xl font-bold text-white font-[Space_Grotesk]">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-5 border-b border-white/5">
                  <h3 className="font-bold text-white">All Engagements</h3>
                </div>
                {applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No engagements yet</p>
                  </div>
                ) : (
                  <table className="table-dark">
                    <thead>
                      <tr><th>Student</th><th>Project / NGO</th><th>Status</th><th>Hours</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 30).map(app => (
                        <tr key={app.id}>
                          <td className="text-white font-medium text-sm">{app.studentName || app.studentId.slice(0, 8) + '...'}</td>
                          <td className="text-sm text-slate-400">{app.ngoId.slice(0, 12)}...</td>
                          <td>
                            <span className={`chip ${APP_COLORS[app.status] || 'chip-slate'}`} style={{ fontSize: '10px' }}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="font-semibold text-sm">{app.hoursLogged || 0}h</td>
                          <td className="text-xs text-slate-500">{app.appliedAt?.toDate?.()?.toLocaleDateString?.('en-IN') || 'Recently'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
