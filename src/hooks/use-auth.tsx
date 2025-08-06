
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { updateUserProfile, getUserProfile, type UserProfile } from '@/services/user-service';
import { updateUserLoginStreak } from '@/services/stats-service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<any>;
  logout: () => Promise<void>;
  updateUserPhotoURL: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

const syncUserProfile = async (user: User) => {
    // Check if user already exists in Firestore
    const existingProfile = await getUserProfile(user.uid);

    // Use existing profile data as a fallback, or user data, or empty strings
    const profile: UserProfile = {
        uid: user.uid,
        email: user.email || existingProfile?.email || '',
        displayName: user.displayName || existingProfile?.displayName || 'New User',
        photoURL: existingProfile?.photoURL ?? user.photoURL, // Preserve existing photoURL if it exists
    };
    
    // Only update if there is something to update
    if (profile.email && profile.displayName) {
        await updateUserProfile(profile);
    }
    
    // Update login streak
    await updateUserLoginStreak(user.uid);

    return profile;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const profile = await syncUserProfile(user); // Sync profile and login streak
        const userWithPhoto = createUserWithPhoto(user, profile.photoURL || user.photoURL);
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
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  const logout = async () => {
    const auth = getAuthInstance();
    await signOut(auth);
    router.push('/login');
  };

  const updateUserPhotoURL = async (photoURL: string) => {
    const auth = getAuthInstance();
    if (auth.currentUser) {
      // Update the user state in the context to trigger a re-render immediately
      const updatedUser = createUserWithPhoto(auth.currentUser, photoURL);
      setUser(updatedUser);

      // Also update it in Firestore
      await updateUserProfile({
          uid: auth.currentUser.uid,
          photoURL: photoURL,
      });
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
