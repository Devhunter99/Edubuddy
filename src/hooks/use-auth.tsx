
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<any>;
  logout: () => Promise<void>;
  updateUserPhotoURL: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

// Helper function to create a new user object with an updated photoURL
const createUserWithPhoto = (user: User, photoURL: string | null): User => {
  return {
      ...user,
      displayName: user.displayName,
      email: user.email,
      photoURL: photoURL,
      providerId: user.providerId,
      uid: user.uid,
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see if there's a custom photo in local storage
        const customPhotoURL = localStorage.getItem(`user_photo_${user.uid}`);
        const userWithPhoto = createUserWithPhoto(user, customPhotoURL || user.photoURL);
        setUser(userWithPhoto);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  const logout = async () => {
    await signOut(auth);
    // Clear local storage for the user on logout
    if (user) {
        localStorage.removeItem(`user_photo_${user.uid}`);
        localStorage.removeItem(`user_study_level_${user.uid}`);
    }
    router.push('/login');
  };

  const updateUserPhotoURL = async (photoURL: string) => {
    if (auth.currentUser) {
      // Save the new photoURL to localStorage
      localStorage.setItem(`user_photo_${auth.currentUser.uid}`, photoURL);
      
      // Update the user state in the context to trigger a re-render
      const updatedUser = createUserWithPhoto(auth.currentUser, photoURL);
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    googleLogin,
    logout,
    updateUserPhotoURL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
