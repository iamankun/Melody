
"use client";

import { useMusicPlayer } from "@/contexts/MusicContext";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Play, Pause, SkipForward, SkipBack, Music } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import Link from "next/link";

export function MusicPlayer() {
  const { currentSong, isPlaying, togglePlay, setAudioElement } = useMusicPlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioElement(audioRef.current);
  }, [setAudioElement]);

  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Lỗi khi phát nhạc", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentSong]);


  return (
    <AnimatePresence>
      {currentSong && (
        <motion.div
          className="fixed bottom-4 right-4 z-50"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 150, damping: 25 }}
        >
          <Card className="w-80 p-4">
            <div className="flex items-center gap-4">
              <Image
                src={currentSong.artwork}
                alt={currentSong.title}
                width={64}
                height={64}
                className="rounded-md"
                data-ai-hint="album cover"
              />
              <div className="flex-1 overflow-hidden">
                <p className="font-bold truncate">{currentSong.title}</p>
                <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
              </div>
            </div>
            <div className="mt-4">
               <audio 
                 ref={audioRef}
                 src={currentSong.url} 
                 className="w-full h-10 hidden" 
                 onEnded={togglePlay}
                 crossOrigin="anonymous"
                />

              <div className="flex items-center justify-center gap-2 mt-2">
                <Button variant="ghost" size="icon" disabled>
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button onClick={togglePlay} size="icon" className="w-12 h-12">
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" disabled>
                  <SkipForward className="w-5 h-5" />
                </Button>
                 <Button asChild variant="ghost" size="icon">
                    <Link href="/identify">
                        <Music className="w-5 h-5"/>
                    </Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
