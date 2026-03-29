
"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { useMusicPlayer } from '@/contexts/MusicContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ScreenShare, AlertTriangle, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type PermissionName =
  | 'geolocation' | 'notifications' | 'push' | 'midi' | 'camera' | 'microphone' | 'speaker'
  | 'device-info' | 'background-sync' | 'bluetooth' | 'persistent-storage'
  | 'ambient-light-sensor' | 'accelerometer' | 'gyroscope' | 'magnetometer';

export default function VisualizerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { analyser: playerAnalyser, isPlaying: isPlayerPlaying, setIsVisualizerActive } = useMusicPlayer();
  
  const [activeSource, setActiveSource] = useState<'none' | 'player' | 'mic' | 'system'>('none');
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [isSystemAudioDisabled, setIsSystemAudioDisabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsVisualizerActive(true);
    return () => setIsVisualizerActive(false);
  }, [setIsVisualizerActive]);

  useEffect(() => {
    const checkMicPermission = async () => {
        if (navigator.permissions) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as any });
                setMicPermission(permissionStatus.state);
                permissionStatus.onchange = () => setMicPermission(permissionStatus.state);
            } catch (err) {
                 console.error("Lỗi khi truy vấn quyền micro:", err);
            }
        }
    };
    checkMicPermission();
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        setIsSystemAudioDisabled(true);
    }
  }, []);

  const cleanupStream = useCallback(() => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
          sourceNodeRef.current = null;
      }
      setAnalyser(null);
      setActiveSource('none');
  }, []);

  const setupAudioProcessing = useCallback(async (sourceType: 'mic' | 'system') => {
      cleanupStream();
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          const context = audioContextRef.current;
          let stream: MediaStream;
          if (sourceType === 'mic') {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } else {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
             if (displayStream.getAudioTracks().length > 0) {
                stream = new MediaStream(displayStream.getAudioTracks());
                displayStream.getVideoTracks().forEach(track => track.stop());
             } else {
                displayStream.getTracks().forEach(track => track.stop());
                throw new Error("Không tìm thấy âm thanh.");
             }
          }
          streamRef.current = stream;
          const analyserNode = context.createAnalyser();
          analyserNode.fftSize = 512;
          sourceNodeRef.current = context.createMediaStreamSource(stream);
          sourceNodeRef.current.connect(analyserNode);
          setAnalyser(analyserNode);
          setActiveSource(sourceType);
          stream.getTracks()[0].onended = () => cleanupStream();
      } catch (err) {
          console.error(`Lỗi:`, err);
          toast({ variant: 'destructive', title: `Lỗi truy cập thiết bị`, description: "Không thể kết nối nguồn âm thanh." });
          cleanupStream();
      }
  }, [cleanupStream, toast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentAnalyser = isPlayerPlaying ? playerAnalyser : analyser;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;
    
    let animationFrameId: number;
    const bufferLength = currentAnalyser ? currentAnalyser.frequencyBinCount : 0;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      canvasCtx.clearRect(0, 0, width, height);

      if (!currentAnalyser) return;
      currentAnalyser.getByteFrequencyData(dataArray);

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;
      const barCount = 120;
      
      canvasCtx.shadowBlur = 15;
      canvasCtx.shadowColor = "hsl(var(--primary))";

      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2;
        const value = dataArray[i % bufferLength] / 255;
        const barHeight = value * 100 + 5;
        
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        const gradient = canvasCtx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, "hsl(var(--primary))");
        gradient.addColorStop(1, "hsl(var(--accent))");

        canvasCtx.strokeStyle = gradient;
        canvasCtx.lineWidth = 3;
        canvasCtx.lineCap = "round";
        canvasCtx.beginPath();
        canvasCtx.moveTo(x1, y1);
        canvasCtx.lineTo(x2, y2);
        canvasCtx.stroke();
      }
      
      // Vẽ vòng tròn trung tâm phát sáng
      canvasCtx.beginPath();
      canvasCtx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
      canvasCtx.strokeStyle = "hsla(var(--primary), 0.3)";
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [playerAnalyser, isPlayerPlaying, analyser]);

  const currentActiveSource = isPlayerPlaying ? 'player' : activeSource;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full p-4 overflow-hidden">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-0" />
      <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-0" />
      
      <AnimatePresence>
        {currentActiveSource === 'none' && (
          <motion.div 
              className="z-10 flex flex-col items-center text-center max-w-md gap-8 p-8 rounded-3xl bg-background/40 backdrop-blur-xl border border-white/10 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
          >
              <div className="p-4 rounded-full bg-primary/20 animate-pulse">
                <Music2 className="w-12 h-12 text-primary" />
              </div>
              <div>
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Visualizer Neon
                  </h2>
                  <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
                    Hãy đánh thức âm nhạc của bạn với màn trình diễn ánh sáng sống động.
                  </p>
              </div>

              <div className='flex flex-col w-full gap-3'>
                 <Button size="lg" onClick={() => setupAudioProcessing('mic')} disabled={micPermission === 'denied'} className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20">
                    <Mic className="mr-2 h-5 w-5" />
                    Bắt đầu với Micro
                </Button>
                <Button size="lg" onClick={() => setupAudioProcessing('system')} variant="outline" disabled={isSystemAudioDisabled} className="w-full h-12 text-lg font-semibold border-white/10 hover:bg-white/5">
                    <ScreenShare className="mr-2 h-5 w-5" />
                    Âm thanh hệ thống
                </Button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlayerPlaying && currentActiveSource !== 'none' && (
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4 p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
            <Button
                variant={currentActiveSource === 'mic' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => currentActiveSource === 'mic' ? cleanupStream() : setupAudioProcessing('mic')}
                className="w-12 h-12 rounded-xl"
            >
                <Mic className="w-6 h-6" />
            </Button>
            <Button
                variant={currentActiveSource === 'system' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => currentActiveSource === 'system' ? cleanupStream() : setupAudioProcessing('system')}
                disabled={isSystemAudioDisabled}
                className="w-12 h-12 rounded-xl"
            >
                <ScreenShare className="w-6 h-6" />
            </Button>
        </motion.div>
      )}
    </div>
  );
}
