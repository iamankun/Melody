
import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { MusicProvider } from '@/contexts/MusicContext';
import { MusicPlayer } from '@/components/features/music-player';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <MusicProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 flex flex-col">{children}</main>
        <MusicPlayer />
      </div>
    </MusicProvider>
  );
}
