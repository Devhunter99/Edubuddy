
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { updateUserProfile, getUserProfile, type UserProfile } from '@/services/user-service';

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

const syncUserProfile = async (user: User) => {
    if (!user.email || !user.displayName) return;
    
    // Check if user already exists in Firestore
    const existingProfile = await getUserProfile(user.uid);

    const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: existingProfile?.photoURL ?? user.photoURL, // Preserve existing photoURL if it exists
    };
    await updateUserProfile(profile);
    return profile;
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const profile = await syncUserProfile(user); // Sync profile with Firestore
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
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateUserPhotoURL = async (photoURL: string) => {
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
