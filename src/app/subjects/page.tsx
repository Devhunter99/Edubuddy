"use client";
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';

// This is a client-side component that redirects to the home page.
export default function SubjectsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null; // or a loading spinner
}
