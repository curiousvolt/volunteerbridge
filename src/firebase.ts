import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Vite env vars take priority; fall back to AI Studio config values
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyAh8oVL-J8MLD4UX1j-6iUtjrCRKXp6avE",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "gen-lang-client-0091584575.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "gen-lang-client-0091584575",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "gen-lang-client-0091584575.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "774325007832",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:774325007832:web:5ed07e4b99d448228c2ead",
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-3f82d4a4-690f-4f36-815e-748c6430c069";

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
