
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { app, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  googleLogin: () => Promise<any>;
  logout: () => Promise<void>;
  updateUserPhotoURL: (photoURL: string) => Promise<void>;
  uploadAndSetProfilePicture: (file: File | string, user: User) => Promise<void>;
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
      // Create a new user object to trigger a state update in React
      const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser);
      setUser(updatedUser);
    }
  };

  const uploadAndSetProfilePicture = async (file: File | string, userToUpdate: User) => {
      if (!userToUpdate) return;
      
      const storageRef = ref(storage, `profile-pictures/${userToUpdate.uid}/profile.jpg`);
      
      let downloadURL;

      if (typeof file === 'string') { // It's a data URL
          await uploadString(storageRef, file, 'data_url');
          downloadURL = await getDownloadURL(storageRef);
      } else { // It's a File object
          await uploadBytes(storageRef, file);
          downloadURL = await getDownloadURL(storageRef);
      }

      await updateUserPhotoURL(downloadURL);
  };


  const value = {
    user,
    loading,
    googleLogin,
    logout,
    updateUserPhotoURL,
    uploadAndSetProfilePicture,
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
