import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  role: 'student' | 'ngo' | 'nss';
  name: string;
  email: string;
  createdAt: any;
  // Student
  college?: string;
  yearOfStudy?: string;
  skills?: string[];
  causes?: string[];
  location?: string;
  availability?: number;
  nssEnrolled?: boolean;
  bio?: string;
  // NGO
  darpanId?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNSUBMITTED';
  ngoDescription?: string;
  is80G?: boolean;
  isFcra?: boolean;
  ngoLocation?: string;
  ngoCauses?: string[];
  // NSS
  nssCollege?: string;
  nssUnit?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  registerProfile: (role: 'student' | 'ngo' | 'nss', data: Partial<UserProfile>) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await fetchProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const registerProfile = async (
    role: 'student' | 'ngo' | 'nss',
    data: Partial<UserProfile>
  ) => {
    if (!currentUser) return;
    const profile: any = {
      uid: currentUser.uid,
      name: currentUser.displayName || data.name || 'Anonymous',
      email: currentUser.email || '',
      role,
      createdAt: serverTimestamp(),
      ...data,
    };
    await setDoc(doc(db, 'users', currentUser.uid), profile);
    const fresh = await fetchProfile(currentUser.uid);
    setUserProfile(fresh);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid), { ...data });
    setUserProfile(prev => prev ? { ...prev, ...data } : prev);
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    const fresh = await fetchProfile(currentUser.uid);
    setUserProfile(fresh);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userProfile, loading, signInWithGoogle, logout, registerProfile, updateProfile, refreshProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
