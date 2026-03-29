
"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CornerDownLeft, Loader2, User, X, Mic, Circle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

import Melody from '@/components/features/MelodyAI';
import { chat } from "@/ai/flows/chat";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useMusicPlayer } from '@/contexts/MusicContext';
import { AudioRecorder } from '@/components/features/audio-recorder';
import { identifySongFromAudio } from '@/ai/flows/identify-song-from-audio';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { ModelSelector } from '@/components/ai/model-selector';

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Tin nhắn không được để trống." }),
});

interface Message {
  role: "user" | "model";
  content: string;
  audio?: string;
  isThinking?: boolean;
}

export default function MelodyAIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isAnKun, setIsAnKun] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedModel, setSelectedModel] = useState('ollama/llama3');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { playSong } = useMusicPlayer();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  useEffect(() => {
    setIsClient(true);
    // Check local storage to see if the user is An Kun
    const anKunStatus = localStorage.getItem('isAnKun');
    if (anKunStatus === 'true') {
      setIsAnKun(true);
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: "smooth",
        });
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isChatActive || ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setIsChatActive(true);
        
        setTimeout(() => {
            const textarea = promptTextareaRef.current;
            if (textarea) {
              textarea.focus();
              const newPrompt = textarea.value + event.key;
              form.setValue('prompt', newPrompt);
              textarea.selectionStart = textarea.selectionEnd = newPrompt.length;
            }
        }, 100); 
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatActive, form]);
  
  const handleStartChat = useCallback(async () => {
    if (!isChatActive) {
      setIsChatActive(true);
      // Don't use the chat function for the initial message.
      const initialMessage = {
        role: 'model' as const,
        content:
          'Tôi là Melody AI - Chàng trai Giai Điệu. Bạn cần gì ở mình vào hôm nay?',
      };
      setMessages([initialMessage]);
    }
  }, [isChatActive]);

  const runChat = useCallback(async (prompt: string, generateAudio = false) => {
    let anKunFlag = isAnKun;
    // Check if the user is identifying as An Kun
    if (prompt.trim().toLowerCase() === "tôi là an kun") {
        if (!isAnKun) {
            setIsAnKun(true);
            localStorage.setItem('isAnKun', 'true');
        }
        anKunFlag = true;
    }

    setIsSubmitting(true);
    const userMessage: Message = { role: "user", content: prompt };
    
    // Add user message and a thinking indicator
    setMessages((prev) => [...prev, userMessage, { role: 'model', content: '', isThinking: true }]);
    form.reset();

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const output = await chat({ history, prompt: prompt, isAnKun: anKunFlag, generateAudio, model: selectedModel });

      const modelMessage: Message = { role: "model", content: output.response, audio: output.audio };
      // Replace the thinking indicator with the actual response
      setMessages((prev) => [...prev.slice(0, -1), modelMessage]);

      if (audioRef.current && output.audio) {
        audioRef.current.src = output.audio;
        audioRef.current.play().catch(e => console.error("Lỗi phát âm thanh:", e));
      }
      
      if(output.toolOutputs) {
        const musicToolOutput = output.toolOutputs.find(t => t.toolRequest.name === 'generateAndPlayMusic' || t.toolRequest.name === 'identifySongFromAudio');
        if (musicToolOutput?.response) {
           playSong(musicToolOutput.response);
        }
      }

    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error)?.message || "";
      let toastDescription = "Không thể gửi tin nhắn. Vui lòng thử lại.";
      if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
        toastDescription = "Bạn đã dùng hết lượt miễn phí hôm nay. Vui lòng thử lại sau."
      } else if (errorMessage.includes("503") || errorMessage.toLowerCase().includes("overloaded")) {
        toastDescription = "Mô hình AI hiện đang bận. Vui lòng thử lại sau giây lát."
      } else if (errorMessage) {
        toastDescription = errorMessage;
      }
      
      toast({
        variant: "destructive",
        title: "Đã xảy ra lỗi",
        description: toastDescription,
      });
      // Remove the user message and thinking indicator on error
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsSubmitting(false);
    }
  }, [messages, form, toast, playSong, isAnKun]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    runChat(values.prompt, false);
  };

  const handleTranscription = useCallback((text: string) => {
    if (text) {
      runChat(text, true);
    }
  }, [runChat]);

  const handleMicPermissionDenied = useCallback(() => {
    const modelMessage: Message = {
      role: 'model',
      content: 'Tôi không thể nghe bạn. Nếu bạn ngại, tôi có thể hiểu. Hay micro của bạn bị hỏng, tôi có thể giúp gì không?',
    };
    setMessages((prev) => [...prev, modelMessage]);
    
    // Optional: Play TTS for this message as well
    import('@/ai/flows/text-to-speech').then(({ textToSpeech }) => {
        textToSpeech({ text: modelMessage.content }).then(({ audio }) => {
            if (audioRef.current && audio) {
                audioRef.current.src = audio;
                audioRef.current.play().catch(e => console.error("Lỗi phát âm thanh cho tin nhắn từ chối mic:", e));
            }
        }).catch(e => console.error("Lỗi TTS cho tin nhắn từ chối mic:", e));
    });

  }, []);

  const handleIdentifyStart = useCallback((source: 'mic' | 'system') => {
    const sourceText = source === 'mic' ? 'từ micro' : 'từ máy tính';
    const listeningMessage: Message = { role: "model", content: `Đang nghe ${sourceText}...`, isThinking: true };
    setMessages(prev => [...prev, listeningMessage]);
  }, []);

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      <audio 
        ref={audioRef} 
        className="hidden" 
        onPlay={() => setIsSpeaking(true)}
        onEnded={() => setIsSpeaking(false)}
        onError={() => setIsSpeaking(false)}
      />
      <AnimatePresence>
        {isChatActive && (
          <motion.div
            ref={scrollAreaRef}
            className="absolute inset-0 overflow-y-auto p-4 pt-24 pb-48 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-3xl mx-auto space-y-4">
               {messages.map((message, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 w-full",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {message.role === "model" && (
                     <div className='w-8 h-8 shrink-0'>
                        {isClient && <Melody size={32} isLoading={message.isThinking} />}
                    </div>
                  )}
                  { (message.content || message.isThinking) && (
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 max-w-[80%] backdrop-blur-sm font-medium",
                        message.role === "user"
                          ? "bg-primary/80 text-primary-foreground"
                          : "bg-card/80",
                        message.isThinking && "px-3 py-2"
                      )}
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                    >
                      {message.isThinking ? 
                        <div className="flex items-center gap-2">
                           <Loader2 className="h-5 w-5 animate-spin text-primary" />
                           {message.content && <p className="whitespace-pre-wrap text-base">{message.content}</p>}
                        </div>
                        :
                        <p className="whitespace-pre-wrap text-base">{message.content}</p>
                      }
                    </div>
                  )}
                  {message.role === "user" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isClient && <Melody 
        position={isChatActive ? "bottom" : "center"}
        size={isChatActive ? 120 : 200}
        isLoading={isSubmitting || isSpeaking} 
        onClick={handleStartChat}
      />}

      <AnimatePresence>
        {isChatActive && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 p-4 bg-background/50 backdrop-blur-sm"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 150, damping: 25 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full max-w-3xl mx-auto gap-2"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Textarea
                          placeholder="Nhắn tin cho Melody AI..."
                          {...field}
                          ref={promptTextareaRef}
                          rows={1}
                          className="resize-none min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              form.handleSubmit(onSubmit)()
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <AudioRecorder 
                    mode="chat"
                    onTranscriptionComplete={handleTranscription} 
                    isSubmitting={isSubmitting}
                    onPermissionDenied={handleMicPermissionDenied}
                />
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  disabled={isSubmitting}
                  className="w-48"
                />
                 <AudioRecorder
                    mode="identify"
                    onTranscriptionComplete={() => { /* Not used for chat */ }}
                    isSubmitting={isSubmitting}
                    onPermissionDenied={handleMicPermissionDenied}
                    onIdentifyStart={handleIdentifyStart}
                />
                <Button type="submit" size="icon" disabled={isSubmitting} className="rounded-md">
                  <CornerDownLeft className="h-4 w-4" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => {
                   setIsChatActive(false)
                   setMessages([])
                   }} aria-label="Đóng cuộc trò chuyện" className="rounded-md">
                    <X className="w-5 h-5" />
                </Button>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

    