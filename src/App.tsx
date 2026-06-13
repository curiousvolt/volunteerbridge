import React from 'react';
import { useAuth } from './AuthContext';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import StudentDashboard from './components/StudentDashboard';
import NGODashboard from './components/NGODashboard';
import NSSDashboard from './components/NSSDashboard';

function needsOnboarding(profile: ReturnType<typeof useAuth>['userProfile']): boolean {
  if (!profile) return false;
  if (profile.role === 'student') {
    // Student needs skills, causes, and location to use matching
    return !profile.skills?.length || !profile.causes?.length || !profile.location;
  }
  return false;
}

export default function App() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Initializing VolunteerBridge...</p>
      </div>
    );
  }

  if (!currentUser || !userProfile) return <Login />;

  if (needsOnboarding(userProfile)) return <Onboarding />;

  if (userProfile.role === 'student') return <StudentDashboard />;
  if (userProfile.role === 'ngo')     return <NGODashboard />;
  if (userProfile.role === 'nss')     return <NSSDashboard />;

  return <Login />;
}
