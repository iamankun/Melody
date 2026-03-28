
"use client";

import Link from "next/link";
import { Music, Tv } from "lucide-react";
import { Logo } from '@/components/shared/logo';
import { Button } from "@/components/ui/button";
import { YoutubeLogo } from "@/components/shared/youtube-logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/melody-ai" className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <span className="hidden font-semibold sm:block text-2xl">
            Melody AI
          </span>
        </Link>
      </div>
      <nav className="flex items-center gap-2">
        <Button asChild variant="ghost">
            <Link href="/youtube">
                <YoutubeLogo className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">YouTube</span>
            </Link>
        </Button>
        <Button asChild variant="ghost">
            <Link href="/visualizer">
                <Tv className="mr-2 h-5 w-5" />
                <span className="hidden sm:inline">Visualizer</span>
            </Link>
        </Button>
      </nav>
    </header>
  );
}
