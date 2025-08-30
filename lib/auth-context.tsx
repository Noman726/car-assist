"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setFirebaseUser(firebaseUser);
        setIsAuthenticated(true);
        
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
          } else {
            // Fallback to Firebase Auth data if no Firestore document exists
            setUser({
              id: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              phone: '',
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // User is signed out
        setFirebaseUser(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting Firebase login with:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase login successful:', userCredential.user.uid);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Firebase login error:', error.code, error.message);
      
      let errorMessage = "Login failed. Please try again.";
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect email or password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      console.log('🚀 Starting Firebase registration...');
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      console.log('✅ Firebase user created:', userCredential.user.uid);
      
      // Update the display name
      await updateProfile(userCredential.user, {
        displayName: userData.fullName
      });

      console.log('✅ Profile updated with display name');

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      console.log('✅ User document created in Firestore');
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      switch (error.code) {
        case 'auth/configuration-not-found':
          errorMessage = "Firebase Authentication is not properly configured. Please contact support.";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your connection and try again.";
          break;
        case 'auth/project-not-found':
          errorMessage = "Firebase project not found. Please check configuration.";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
