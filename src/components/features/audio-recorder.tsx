
"use client";

import { useState, useRef, useCallback } from 'react';
import { Mic, Loader2, Music, ScreenShare, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  isSubmitting: boolean;
  onPermissionDenied?: () => void;
  mode?: 'chat' | 'identify';
  onIdentifyStart?: (source: 'mic' | 'system') => void;
  isVoiceEnabled?: boolean;
}

// Dynamically import OpusMediaRecorder
const OpusMediaRecorder = (typeof window !== 'undefined' ? require('opus-media-recorder') : null) as any;

export function AudioRecorder({ onTranscriptionComplete, isSubmitting, onPermissionDenied, mode = 'chat', onIdentifyStart, isVoiceEnabled = true }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeSource, setActiveSource] = useState<'mic' | 'system' | null>(null);

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const workerOptions = {
    OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm',
    WebMOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm'
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Cleanup happens in onstop event handler
  }, []);

  const startRecording = useCallback(async (source: 'mic' | 'system') => {
    if (isRecording || isSubmitting || isTranscribing) return;

    try {
        let stream: MediaStream;
        if (source === 'mic') {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else { // 'system'
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
          if (displayStream.getAudioTracks().length > 0) {
              stream = new MediaStream(displayStream.getAudioTracks());
              displayStream.getVideoTracks().forEach(track => track.stop());
          } else {
              displayStream.getTracks().forEach(track => track.stop());
              throw new Error("Không tìm thấy âm thanh trong nguồn đã chọn. Vui lòng đảm bảo bạn chia sẻ một tab có âm thanh.");
          }
        }
        streamRef.current = stream;
        setActiveSource(source);

      mediaRecorderRef.current = new OpusMediaRecorder(stream, { mimeType: 'audio/ogg; codecs=opus' }, workerOptions);
      audioChunksRef.current = [];

      mediaRecorderRef.current.onstart = () => {
        setIsRecording(true);
        if (mode === 'identify' && onIdentifyStart) {
            onIdentifyStart(source);
        }
      };

      mediaRecorderRef.current.ondataavailable = (event: { data: Blob }) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setActiveSource(null);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
            console.warn("Blob âm thanh trống, hủy phiên âm.");
            return;
        }
        
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const output = await transcribeAudio({ audioDataUri: base64Audio });
            if (output.transcript) {
              onTranscriptionComplete(output.transcript);
            } else {
              toast({
                variant: 'default',
                title: 'Không nhận dạng được giọng nói',
                description: 'Không thể nhận dạng được giọng nói. Vui lòng thử lại.',
              });
            }
          };
        } catch (error) {
          console.error('Lỗi phiên âm:', error);
          toast({
            variant: 'destructive',
            title: 'Lỗi phiên âm',
            description: 'Đã xảy ra lỗi khi xử lý giọng nói của bạn.',
          });
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error(`Không thể truy cập ${source}: `, err);
      setActiveSource(null);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             if (onPermissionDenied && source === 'mic') {
                onPermissionDenied();
             } else {
                 toast({
                    variant: 'destructive',
                    title: `Quyền truy cập ${source === 'mic' ? 'Micro' : 'Âm thanh hệ thống'} đã bị từ chối`,
                    description: "Vui lòng kiểm tra lại quyền truy cập micro trong cài đặt của trình duyệt và hệ điều hành của bạn.",
                });
             }
        } else if (err.message.includes('permissions policy')) {
            toast({
                variant: 'destructive',
                title: 'Tính năng không được hỗ trợ',
                description: 'Ghi âm thanh hệ thống không được hỗ trợ trong môi trường xem trước này. Vui lòng sử dụng micro.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: `Lỗi ${source === 'mic' ? 'Micro' : 'Âm thanh hệ thống'}`,
                description: `Không thể truy cập thiết bị. ${err.message}`,
            });
        }
      }
    }
  }, [isRecording, isSubmitting, onTranscriptionComplete, onPermissionDenied, toast, workerOptions, mode, onIdentifyStart, isTranscribing]);


  const handleMicClick = () => {
    if (!isVoiceEnabled) {
        toast({
            variant: 'default',
            title: 'Tính năng giọng nói đã bị tắt',
            description: 'Vui lòng bật tính năng giọng nói trong cài đặt để sử dụng micro.',
        });
        return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording('mic');
    }
  };
  
  const handleSystemAudioClick = () => {
    if (!isVoiceEnabled) {
        toast({
            variant: 'default',
            title: 'Tính năng giọng nói đã bị tắt',
            description: 'Vui lòng bật tính năng giọng nói trong cài đặt để sử dụng ghi âm hệ thống.',
        });
        return;
    }
    if (isRecording) {
        stopRecording();
    } else {
        startRecording('system');
    }
  }

  const isDisabled = isSubmitting || isTranscribing;
  const isSystemAudioDisabled = typeof window !== 'undefined' && !window.isSecureContext;


  if (mode === 'identify') {
    return (
        <TooltipProvider>
            <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="icon"
                            onClick={handleMicClick}
                            disabled={isDisabled || !isVoiceEnabled || (isRecording && activeSource !== 'mic')}
                            variant={isRecording && activeSource === 'mic' ? 'destructive' : 'default'}
                            className="rounded-md"
                        >
                            {isTranscribing && activeSource === 'mic' ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isRecording && activeSource === 'mic' ? (
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
                                    <Music className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <Mic className="h-5 w-5" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tìm bài hát qua Micro</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <span tabIndex={isSystemAudioDisabled ? 0 : -1}>
                            <Button
                                type="button"
                                size="icon"
                                onClick={handleSystemAudioClick}
                                disabled={isDisabled || !isVoiceEnabled || isSystemAudioDisabled || (isRecording && activeSource !== 'system')}
                                variant={isRecording && activeSource === 'system' ? 'destructive' : 'default'}
                                className="rounded-md"
                            >
                                {isTranscribing && activeSource === 'system' ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : isRecording && activeSource === 'system' ? (
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
                                        <Music className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <ScreenShare className="h-5 w-5" />
                                )}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                       {isSystemAudioDisabled ? <p>Tính năng này không được hỗ trợ trong môi trường xem trước.</p> : <p>Tìm bài hát qua âm thanh máy tính</p>}
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
  }

  // Chat mode button
  return (
    <Button
      type="button"
      size="icon"
      onClick={handleMicClick}
      disabled={isDisabled || !isVoiceEnabled}
      variant={isRecording ? 'success' : 'default'}
      className="rounded-md"
    >
      {isTranscribing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRecording ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Circle className="h-4 w-4 fill-current" />
        </motion.div>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
