
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
      await updateProfile(auth.currentUser, { photoURL });
      
      const userToUpdate = auth.currentUser;
      if (userToUpdate) {
        // Manually create a new user object to force re-render
        const updatedUser: User = {
          ...userToUpdate,
          displayName: userToUpdate.displayName,
          email: userToUpdate.email,
          photoURL: photoURL, // The new photoURL
          providerId: userToUpdate.providerId,
          uid: userToUpdate.uid,
          // You may need to copy other properties as well
          // This is a simplified example
        } as User;
        
        // This is a bit of a trick to force a state update
        // when the internal state of the user object changes
        // but the object reference does not.
        setUser(null); 
        setUser(updatedUser);
      }
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
