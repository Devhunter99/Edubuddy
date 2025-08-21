
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { updateUserProfile, getUserProfile, type UserProfile } from '@/services/user-service';
import { updateUserLoginStreak } from '@/services/stats-service';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  googleLogin: () => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateUserPhotoURL: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const syncUserProfile = async (user: User): Promise<UserProfile> => {
    const existingProfile = await getUserProfile(user.uid);

    const profile: UserProfile = {
        uid: user.uid,
        email: user.email || existingProfile?.email || '',
        displayName: user.displayName || existingProfile?.displayName || 'New User',
        photoURL: existingProfile?.photoURL ?? user.photoURL,
        collectedStickerIds: existingProfile?.collectedStickerIds || [],
        unlockedFrameIds: existingProfile?.unlockedFrameIds || [],
        equippedFrameId: existingProfile?.equippedFrameId,
    };
    
    if (profile.email && profile.displayName) {
        await updateUserProfile(profile);
    }
    
    await updateUserLoginStreak(user.uid);

    return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await syncUserProfile(firebaseUser);
        setUser(profile);
      } else {
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

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
        setUser(prevUser => ({ ...prevUser!, ...updates }));
    }
  }

  const updateUserPhotoURL = async (photoURL: string) => {
    const auth = getAuthInstance();
    if (auth.currentUser) {
      // Optimistically update local state
      updateUser({ photoURL });
      
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
    updateUser,
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
