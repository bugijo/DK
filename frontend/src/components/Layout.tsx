import { Navbar } from './Navbar';
import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-text-base min-h-screen">
      <Navbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}