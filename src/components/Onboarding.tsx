import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { CAUSES, SKILLS, CITIES, YEARS_OF_STUDY } from '../lib/matchingAlgorithm';
import { Heart, ChevronRight, ChevronLeft, Check, Loader2, MapPin, Clock, BookOpen, Lightbulb } from 'lucide-react';

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const { userProfile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [college, setCollege] = useState(userProfile?.college || '');
  const [yearOfStudy, setYearOfStudy] = useState(userProfile?.yearOfStudy || '');
  const [location, setLocation] = useState(userProfile?.location || '');
  const [skills, setSkills] = useState<string[]>(userProfile?.skills || []);
  const [causes, setCauses] = useState<string[]>(userProfile?.causes || []);
  const [availability, setAvailability] = useState(userProfile?.availability || 5);
  const [bio, setBio] = useState(userProfile?.bio || '');

  const toggleSkill  = (s: string) => setSkills(prev  => prev.includes(s)  ? prev.filter(x => x !== s)  : [...prev, s]);
  const toggleCause  = (c: string) => setCauses(prev  => prev.includes(c)  ? prev.filter(x => x !== c)  : [...prev, c]);

  const canNext = () => {
    if (step === 1) return college.trim() && yearOfStudy && location;
    if (step === 2) return skills.length >= 1;
    if (step === 3) return causes.length >= 1;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile({ college, yearOfStudy, location, skills, causes, availability, bio });
    } finally {
      setSaving(false);
    }
  };

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-orb-1" />
        <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-indigo-600/12 rounded-full blur-3xl animate-orb-2" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 glow-sm">
            <Heart className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white font-[Space_Grotesk]">Set Up Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Help us find perfect volunteer matches for you</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Step {step} of {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i + 1 <= step ? 'bg-violet-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Step card */}
        <div className="glass rounded-2xl p-8 animate-scale-in">

          {/* ── Step 1: Basic Info ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-500/20"><BookOpen className="w-5 h-5 text-violet-400" /></div>
                <div>
                  <h2 className="font-bold text-white">Academic Details</h2>
                  <p className="text-slate-500 text-xs">Tell NGOs where you study</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">College / University *</label>
                <input className="input-dark" placeholder="e.g. IIT Bombay, BITS Pilani" value={college} onChange={e => setCollege(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Year of Study *</label>
                <select className="input-dark" value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)}>
                  <option value="">Select year...</option>
                  {YEARS_OF_STUDY.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  <MapPin className="w-3 h-3 inline mr-1" />City *
                </label>
                <select className="input-dark" value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="">Select city...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Short Bio (optional)</label>
                <textarea
                  className="input-dark resize-none"
                  rows={3}
                  placeholder="Tell NGOs a bit about yourself and your volunteering goals..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Skills ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/20"><Lightbulb className="w-5 h-5 text-indigo-400" /></div>
                <div>
                  <h2 className="font-bold text-white">Your Skills</h2>
                  <p className="text-slate-500 text-xs">Select all that apply (min. 1)</p>
                </div>
                <span className="ml-auto chip chip-indigo">{skills.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`chip transition-all ${skills.includes(s) ? 'chip-indigo selected' : 'chip-slate'}`}
                  >
                    {skills.includes(s) && <Check className="w-3 h-3 mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
              {skills.length === 0 && (
                <p className="text-amber-400/80 text-xs mt-4 text-center">Pick at least one skill to enable matching</p>
              )}
            </div>
          )}

          {/* ── Step 3: Causes ───────────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-rose-500/20"><Heart className="w-5 h-5 text-rose-400" /></div>
                <div>
                  <h2 className="font-bold text-white">Causes You Care About</h2>
                  <p className="text-slate-500 text-xs">Select all that resonate (min. 1)</p>
                </div>
                <span className="ml-auto chip chip-rose">{causes.length} selected</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CAUSES.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCause(c)}
                    className={`chip transition-all ${causes.includes(c) ? 'chip-violet selected' : 'chip-slate'}`}
                  >
                    {causes.includes(c) && <Check className="w-3 h-3 mr-1" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Availability ─────────────────────────────────────── */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-emerald-500/20"><Clock className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <h2 className="font-bold text-white">Your Availability</h2>
                  <p className="text-slate-500 text-xs">How many hours/week can you commit?</p>
                </div>
              </div>

              <div className="text-center mb-8">
                <span className="text-6xl font-bold gradient-text font-[Space_Grotesk]">{availability}</span>
                <p className="text-slate-400 text-sm mt-2">hours per week</p>
              </div>

              <input
                type="range"
                min={1} max={20} step={1}
                value={availability}
                onChange={e => setAvailability(Number(e.target.value))}
                className="w-full mb-4"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1h (casual)</span>
                <span>10h (part-time)</span>
                <span>20h (dedicated)</span>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-sm text-violet-300 text-center">
                  🎉 You're all set! We'll match you with projects that fit your <strong>{availability}h/week</strong> availability.
                </p>
              </div>

              {/* Profile preview */}
              <div className="mt-6 p-4 rounded-xl glass">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Your Profile Summary</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-500">College</span><span>{college || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Year</span><span>{yearOfStudy || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Location</span><span>{location || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Skills</span><span>{skills.length} selected</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Causes</span><span>{causes.length} selected</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex gap-3 mt-8 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="btn-primary flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Start Volunteering!'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
