// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAFU6kWJyrRfLZ0GjtGIvVp4P4JYtGVwIY",
  authDomain: "carassistz.firebaseapp.com",
  projectId: "carassistz",
  storageBucket: "carassistz.firebasestorage.app",
  messagingSenderId: "855043078826",
  appId: "1:855043078826:web:cdfc3d9b2760caf64daed3",
  measurementId: "G-ZH4LGHTZ0X"
};

// Debug: Log Firebase config (remove in production)
console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

// Initialize Firebase (avoid duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
export { analytics };

// Debug: Log Firebase services
console.log('🔥 Firebase services initialized:', {
  auth: !!auth,
  firestore: !!db,
  storage: !!storage,
  analytics: 'initializing...'
});

export default app;
