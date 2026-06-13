import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Heart, Loader2, Users, Building2, ShieldCheck, ArrowRight, Sparkles, Globe, BookOpen } from 'lucide-react';

const STATS = [
  { value: '4 Cr+', label: 'College Students' },
  { value: '500+', label: 'Verified NGOs' },
  { value: '12K+', label: 'Hours Volunteered' },
  { value: '98%', label: 'Match Satisfaction' },
];

const FEATURES = [
  { icon: Sparkles, color: 'violet', title: 'Smart Matching', desc: 'AI-powered algorithm matches you by skills, causes, location & availability' },
  { icon: ShieldCheck, color: 'emerald', title: 'Verified NGOs', desc: 'Every NGO verified via Darpan ID, 80G & FCRA before listing on platform' },
  { icon: Globe, color: 'blue', title: 'Impact Tracking', desc: 'Log hours, earn certificates & build a verified volunteering portfolio' },
];

const ROLES = [
  { id: 'student', icon: Users, label: 'Student Volunteer', desc: 'Find projects matching your skills & schedule', color: 'indigo', field: 'college' },
  { id: 'ngo', icon: Heart, label: 'NGO Partner', desc: 'List projects & find skilled volunteers fast', color: 'rose', field: 'darpanId' },
  { id: 'nss', icon: ShieldCheck, label: 'NSS Coordinator', desc: 'Oversee college volunteering metrics & NGO approvals', color: 'emerald', field: null },
];

export default function Login() {
  const { signInWithGoogle, currentUser, registerProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'ngo' | 'nss'>('student');
  const [college, setCollege] = useState('');
  const [darpanId, setDarpanId] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try { await signInWithGoogle(); }
    catch { setError('Sign-in failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const submitProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data: Record<string, any> = {};
      if (role === 'student') data.college = college;
      if (role === 'ngo') { data.darpanId = darpanId; data.verificationStatus = 'PENDING'; }
      await registerProfile(role, data);
    } catch { setError('Failed to save profile. Try again.'); }
    finally { setLoading(false); }
  };

  // Authenticated but no profile yet → role registration
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-orb-1" />
          <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-orb-2" />
        </div>
        <div className="glass rounded-2xl p-8 w-full max-w-md animate-scale-in relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 glow-sm">
              <Heart className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white font-[Space_Grotesk]">Complete Your Profile</h2>
            <p className="text-slate-400 text-sm mt-2">Welcome, {currentUser.displayName?.split(' ')[0]}! Choose how you'll use VolunteerBridge.</p>
          </div>

          {/* Role selector */}
          <div className="space-y-3 mb-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  role === r.id
                    ? 'bg-violet-500/15 border-violet-500/50 shadow-lg shadow-violet-500/10'
                    : 'glass border-white/8 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${role === r.id ? 'bg-violet-500/20' : 'bg-white/5'}`}>
                  <r.icon className={`w-5 h-5 ${role === r.id ? 'text-violet-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${role === r.id ? 'text-white' : 'text-slate-300'}`}>{r.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                </div>
                {role === r.id && <div className="ml-auto w-2 h-2 rounded-full bg-violet-400" />}
              </button>
            ))}
          </div>

          {/* Role-specific fields */}
          {role === 'student' && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">College / University</label>
              <input className="input-dark" placeholder="e.g. IIT Bombay" value={college} onChange={e => setCollege(e.target.value)} />
            </div>
          )}
          {role === 'ngo' && (
            <div className="mb-6 animate-fade-in">
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Darpan Registration ID</label>
              <input className="input-dark" placeholder="e.g. MH/2026/0122334" value={darpanId} onChange={e => setDarpanId(e.target.value)} />
              <p className="text-[11px] text-slate-500 mt-1.5">Required for NGO verification. Format: ST/YYYY/XXXXXXX</p>
            </div>
          )}
          {role === 'nss' && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
              <p className="text-sm text-emerald-400">As NSS Coordinator you'll have full platform oversight — NGO verification queue, volunteer metrics, and college-level analytics.</p>
            </div>
          )}

          {error && <p className="text-rose-400 text-sm mb-4 text-center">{error}</p>}

          <button onClick={submitProfile} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {role === 'student' ? 'Continue to Skills Setup →' : 'Complete Setup →'}
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated → hero landing
  return (
    <div className="min-h-screen bg-gradient-hero text-white overflow-x-hidden">
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute top-2/3 -right-40 w-[400px] h-[400px] bg-indigo-600/12 rounded-full blur-3xl animate-orb-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Heart className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg font-[Space_Grotesk]">VolunteerBridge</span>
          <span className="hidden md:block text-[10px] font-semibold text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/30">BETA</span>
        </div>
        <button onClick={handleSignIn} disabled={loading} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-sm text-violet-300 mb-8 animate-slide-up">
          <Sparkles className="w-4 h-4 text-violet-400" />
          NSS-backed • Darpan-verified • Impact-tracked
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-[Space_Grotesk] mb-6 animate-slide-up delay-100 leading-tight">
          Connect.&nbsp;
          <span className="gradient-text">Contribute.</span>
          <br />Change.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up delay-200">
          India's smartest volunteer–NGO matching platform. We pair 4 crore+ college students with verified NGO projects using skills, availability, location & cause alignment.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up delay-300">
          <button onClick={handleSignIn} disabled={loading} className="btn-primary flex items-center gap-3 text-base py-4 px-8">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-slate-500 text-sm">Free forever for students & NGOs</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up delay-400">
          {STATS.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 card-hover">
              <p className="text-2xl md:text-3xl font-bold gradient-text font-[Space_Grotesk]">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center font-[Space_Grotesk] mb-12">
          Why <span className="gradient-text">VolunteerBridge</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className={`glass rounded-2xl p-7 card-hover animate-slide-up delay-${(i+1)*100}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                f.color === 'violet' ? 'bg-violet-500/20' :
                f.color === 'emerald' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
              }`}>
                <f.icon className={`w-6 h-6 ${
                  f.color === 'violet' ? 'text-violet-400' :
                  f.color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'
                }`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-[Space_Grotesk]">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-3xl font-bold text-center font-[Space_Grotesk] mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Sign Up & Build Profile', desc: 'Set your skills, causes you care about, location & weekly hours you can give.' },
            { step: '02', title: 'Get Matched Instantly', desc: 'Our algorithm ranks verified NGO projects by compatibility score — best matches first.' },
            { step: '03', title: 'Volunteer & Track Impact', desc: 'Apply, get accepted, log hours, earn certificates & submit mutual feedback.' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 glow-sm">
                <span className="text-white font-bold font-[Space_Grotesk]">{s.step}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-20 text-center">
        <div className="glass rounded-3xl p-12 border border-violet-500/20 glow-violet">
          <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold font-[Space_Grotesk] mb-4">Ready to make an impact?</h2>
          <p className="text-slate-400 mb-8">Join thousands of students already volunteering through VolunteerBridge.</p>
          <button onClick={handleSignIn} disabled={loading} className="btn-primary inline-flex items-center gap-3 text-base py-4 px-8">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-sm font-[Space_Grotesk]">VolunteerBridge</span>
        </div>
        <p className="text-slate-600 text-xs">Built for NSS Challenge 4.1 — Product Innovation Track • © 2026</p>
      </footer>
    </div>
  );
}
