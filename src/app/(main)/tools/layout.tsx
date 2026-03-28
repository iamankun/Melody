import {AppHeader} from '@/components/layout/app-header';
import {MusicPlayer} from '@/components/features/music-player';
import {SidebarNav} from '@/components/layout/sidebar-nav';
import {MusicProvider} from '@/contexts/MusicContext';
import {toolGroups} from './data';

export default function ToolsLayout({children}: {children: React.ReactNode}) {
  return (
    <MusicProvider>
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav groups={toolGroups} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
      <MusicPlayer />
    </MusicProvider>
  );
}
