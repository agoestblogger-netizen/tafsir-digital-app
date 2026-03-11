"use client";

import { useState, useEffect } from "react";

type AudioState = {
  activeVerseKey: string | null;
  activeWordId: number | null; // Tracks the currently playing word ID during verse playback
  isPlaying: boolean;
  currentTime: number;
};

// Global instance to coordinate single audio playback
class GlobalAudioPlayer {
  private audio: HTMLAudioElement;
  private state: AudioState = { activeVerseKey: null, activeWordId: null, isPlaying: false, currentTime: 0 };
  private listeners: Set<(state: AudioState) => void> = new Set();
  private currentSegments: [number, number, number, number][] | null = null;
  private animationFrameId: number | null = null;

  constructor() {
    // Only initialize audio in browser
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.audio.addEventListener("timeupdate", () => {
        this.updateState({ currentTime: this.audio.currentTime });
      });
      this.audio.addEventListener("play", () => {
        this.updateState({ isPlaying: true });
        this.startSyncLoop();
      });
      this.audio.addEventListener("pause", () => {
        this.updateState({ isPlaying: false });
        this.stopSyncLoop();
      });
      this.audio.addEventListener("ended", () => {
        this.updateState({ isPlaying: false, activeVerseKey: null, activeWordId: null, currentTime: 0 });
        this.currentSegments = null;
        this.stopSyncLoop();
      });
      this.audio.addEventListener("error", (e) => {
        console.warn("Audio playback error:", e);
        this.updateState({ isPlaying: false, activeVerseKey: null, activeWordId: null });
        this.stopSyncLoop();
      });
    } else {
      this.audio = {} as HTMLAudioElement; // dummy for SSR
    }
  }
  
  private startSyncLoop() {
    if (this.animationFrameId !== null) return;
    
    const sync = () => {
      this.syncTime();
      this.animationFrameId = requestAnimationFrame(sync);
    };
    this.animationFrameId = requestAnimationFrame(sync);
  }

  private stopSyncLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private syncTime() {
    if (!this.audio || this.audio.paused) return;
    
    // Only run precision check if we are playing a verse with segments
    if (this.currentSegments && this.currentSegments.length > 0) {
      const timeMs = this.audio.currentTime * 1000;
      let activeWord = null;
      
      // Segment format is [word_index_0_based, ???, start_ms, end_ms]
      const segment = this.currentSegments.find(s => timeMs >= s[2] && timeMs <= s[3]);
      if (segment) {
        // Direct Mapping: The api's segment[0] is exactly the 0-based position.
        // We look up the word ID using the exact position, ignoring sequential array lengths.
        const exactPosition = segment[0] + 1;
        if (this.positionToWordId && this.positionToWordId[exactPosition]) {
          activeWord = this.positionToWordId[exactPosition];
        }
      }
      
      // Only trigger React state update if the active word actually changed
      if (this.state.activeWordId !== activeWord) {
        this.updateState({ activeWordId: activeWord });
      }
    }
  }

  private updateState(newState: Partial<AudioState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: AudioState) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => { Object.is(this.listeners.delete(listener), true); };
  }

  private positionToWordId: Record<number, number> | null = null;

  playVerse(verseKey: string, url: string, segments?: [number, number, number, number][], positionMap?: Record<number, number>) {
    this.clearWordTimeout();
    
    if (this.state.activeVerseKey === verseKey && this.state.activeWordId === null) {
      // If same verse full playback, resume
      this.safePlay();
    } else {
      // New full verse playback
      this.currentSegments = segments || null;
      this.positionToWordId = positionMap || null;
      this.audio.src = url;
      this.safePlay();
      this.updateState({ activeVerseKey: verseKey, activeWordId: null, currentTime: 0 });
    }
  }

  private safePlay() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Audio playback prevented or failed:", error);
        this.updateState({ isPlaying: false, activeVerseKey: null, activeWordId: null });
      });
    }
  }
  
  private handleWordEnded = () => {
    // Only reset if we haven't started playing something else
    this.updateState({ isPlaying: false, activeVerseKey: null, activeWordId: null });
  }
  
  private clearWordTimeout() {
    this.audio.removeEventListener('ended', this.handleWordEnded);
  }

  pause() {
    this.audio.pause();
  }
}

// Singleton
export const globalAudioPlayer = new GlobalAudioPlayer();

export function useAudioState() {
  const [state, setState] = useState<AudioState>({ activeVerseKey: null, activeWordId: null, isPlaying: false, currentTime: 0 });

  useEffect(() => {
    return globalAudioPlayer.subscribe(setState);
  }, []);

  return {
    ...state,
    playVerse: (verseKey: string, url: string, segments?: [number, number, number, number][], positionMap?: Record<number, number>) => globalAudioPlayer.playVerse(verseKey, url, segments, positionMap),
    pause: () => globalAudioPlayer.pause(),
  };
}
