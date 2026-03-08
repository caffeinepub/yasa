import React, { ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import BottomNavigation from './BottomNavigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo.dim_256x256.png" alt="Yasa" className="h-10 w-10" />
            <h1 className="text-2xl font-bold gradient-text">Yasa</h1>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-8rem)]">{children}</main>

      <BottomNavigation />

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
          <p>© {new Date().getFullYear()} Yasa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
