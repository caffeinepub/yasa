import React from 'react';
import LoginButton from '../components/auth/LoginButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/assets/generated/logo.dim_256x256.png" alt="Yasa" className="h-10 w-10" />
            <h1 className="text-2xl font-bold gradient-text">Yasa</h1>
          </div>
          <LoginButton />
        </div>
      </header>

      <main>
        <section
          className="relative min-h-[600px] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/hero-background.dim_1920x1080.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
          <div className="relative z-10 container px-4 text-center space-y-6">
            <h2 className="text-5xl md:text-7xl font-bold gradient-text animate-fade-in">
              Connect. Share. Involve.
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Join the social media revolution. Share your moments, connect with friends, and be part of something special.
            </p>
            <div className="pt-4">
              <LoginButton />
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Yasa?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 mx-auto rounded-full gradient-coral-purple flex items-center justify-center">
                  <img src="/assets/generated/heart-icon.dim_48x48.png" alt="Connect" className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold">Connect with Friends</h4>
                <p className="text-muted-foreground">
                  Follow your friends, share your moments, and stay connected with the people who matter most.
                </p>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 mx-auto rounded-full gradient-coral-purple flex items-center justify-center">
                  <img src="/assets/generated/camera-icon.dim_64x64.png" alt="Share" className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold">Share Your Story</h4>
                <p className="text-muted-foreground">
                  Post photos, videos, and stories that disappear after 24 hours. Express yourself freely.
                </p>
              </div>

              <div className="text-center space-y-4 p-6 rounded-2xl bg-card shadow-soft">
                <div className="w-16 h-16 mx-auto rounded-full gradient-coral-purple flex items-center justify-center">
                  <img src="/assets/generated/chat-icon.dim_48x48.png" alt="Chat" className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold">Private Messaging</h4>
                <p className="text-muted-foreground">
                  Send direct messages to your friends and have private conversations in a secure environment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

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
