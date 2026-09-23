"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const preferenceKey = "serenity-background-music-enabled";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(preferenceKey);
    const shouldPlay = savedPreference !== "false";

    const audio = audioRef.current;
    if (!audio) return;
    const audioElement: HTMLAudioElement = audio;
    audioElement.volume = 0.5;

    async function startAfterInteraction(event: Event) {
      if (event.target instanceof Element && event.target.closest(".music-toggle")) return;
      if (!shouldPlay || !audioElement.paused) return;
      try {
        await audioElement.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }

    window.addEventListener("pointerdown", startAfterInteraction, { once: true });
    window.addEventListener("keydown", startAfterInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
    };
  }, []);

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      window.localStorage.setItem(preferenceKey, "false");
      return;
    }

    try {
      audio.volume = 0.5;
      await audio.play();
      setPlaying(true);
      window.localStorage.setItem(preferenceKey, "true");
    } catch {
      setPlaying(false);
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/background-music.mp3" loop preload="none" aria-hidden="true" />
      <button
        className="music-toggle"
        type="button"
        onClick={toggleMusic}
        aria-label={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
        aria-pressed={playing}
        title={playing ? "Tắt nhạc nền" : "Bật nhạc nền"}
      >
        {playing ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
        <span>{playing ? "Nhạc nền" : "Bật nhạc"}</span>
      </button>
    </>
  );
}
