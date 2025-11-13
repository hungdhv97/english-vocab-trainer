import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ProfileBanner } from '@/components/profile/ProfileBanner';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component that wraps all pages with Header and Footer.
 * Ensures consistent navigation and layout across all routes.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ProfileBanner />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

