import { EnhancedNavbar } from './EnhancedNavbar';
import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-text-base min-h-screen">
      <EnhancedNavbar />
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}