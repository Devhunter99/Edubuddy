
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url('https://placehold.co/1200x800/000000/FFFFFF.png?text=abstract+art')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
        }}
        data-ai-hint="abstract art"
      />
      <div className="relative z-10 flex flex-col items-center text-center p-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-4 leading-tight">
          Discover,
          <br />
          collect, and sell
          <br />
          extraordinary
          <br />
          <span className="text-primary">NFTS</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8">
          The premier marketplace for exploring and trading unique digital assets.
        </p>
        <Link href="/subjects">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-12 py-6 rounded-full shadow-lg shadow-primary/50 transition-transform transform hover:scale-105">
              Let's Get Started
            </Button>
        </Link>
      </div>
    </div>
  );
}
