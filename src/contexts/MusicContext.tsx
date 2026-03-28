
"use client";

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';

interface Song {
  title: string;
  artist: string;
  artwork: string;
  url: string; 
}

// Sample song library
const songLibrary: Song[] = [
    { 
        title: "Anh Yêu Vội Thế", 
        artist: "LaLa Trần", 
        artwork: "/songs/artworks/anh-yeu-voi-the.jpeg", 
        url: "/songs/audio/anh-yeu-voi-the.mp3"
    },
    { 
        title: "Phóng Xe Đêm", 
        artist: "Minh Min", 
        artwork: "/songs/artworks/phong-xe-dem.jpeg", 
        url: "/songs/audio/phong-xe-dem.mp3"
    },
    { 
        title: "Tìm Lại", 
        artist: "Mr.Siro", 
        artwork: "/songs/artworks/tim-lai.jpeg", 
        url: "/songs/audio/tim-lai.mp3"
    }
];

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
  analyser: AnalyserNode | null;
  isVisualizerActive: boolean;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  findAndPlaySong: (title: string) => boolean;
  setAudioElement: (element: HTMLAudioElement | null) => void;
  setIsVisualizerActive: (isActive: boolean) => void;
  setSinkId: (deviceId: string) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isVisualizerActive, setIsVisualizerActive] = useState<boolean>(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');


  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);


  const getAudioDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        console.warn("enumerateDevices() không được hỗ trợ.");
        return;
      }
       // Yêu cầu quyền truy cập micro một cách tạm thời để lấy danh sách đầy đủ các thiết bị
       // Đây là một quirk của API để bảo vệ quyền riêng tư của người dùng
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.getTracks().forEach(track => track.stop()); // Dừng ngay lập tức sau khi có quyền

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputDevices = allDevices.filter(device => device.kind === 'audiooutput');
      setDevices(audioOutputDevices);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thiết bị âm thanh:", err);
      // Ngay cả khi có lỗi, vẫn cố gắng lấy danh sách thiết bị, có thể nó không đầy đủ
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputDevices = allDevices.filter(device => device.kind === 'audiooutput');
        setDevices(audioOutputDevices);
      } catch (e) {
          console.error("Không thể lấy danh sách thiết bị ngay cả sau khi lỗi:", e);
      }
    }
  }, []);

  useEffect(() => {
    getAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    };
  }, [getAudioDevices]);


  useEffect(() => {
    if (audioElement && currentSong && !audioContextRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      setAnalyser(analyserNode);

      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audioElement);
      }
      sourceRef.current.connect(analyserNode);
      analyserNode.connect(context.destination);
    }
  }, [audioElement, currentSong]);


  const setSinkId = async (deviceId: string) => {
    if (!audioElement || typeof (audioElement as any).setSinkId !== 'function') {
        console.warn('Trình duyệt không hỗ trợ chọn thiết bị đầu ra âm thanh.');
        return;
    }
    try {
        await (audioElement as any).setSinkId(deviceId);
        setSelectedDeviceId(deviceId);
    } catch (error) {
        console.error('Lỗi khi đặt thiết bị đầu ra:', error);
    }
  };

  const findAndPlaySong = (title: string): boolean => {
    const foundSong = songLibrary.find(song => song.title.toLowerCase() === title.toLowerCase());
    if (foundSong) {
        playSong(foundSong);
        return true;
    }
    return false;
  }


  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (currentSong) {
        if (isPlaying) {
            audioElement?.pause();
        } else {
            audioElement?.play();
        }
      setIsPlaying(!isPlaying);
    }
  };

  const value = {
    currentSong,
    isPlaying,
    audioElement,
    analyser,
    isVisualizerActive,
    devices,
    selectedDeviceId,
    playSong,
    togglePlay,
    setAudioElement,
    setIsVisualizerActive,
    setSinkId,
    findAndPlaySong,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  return context;
};
