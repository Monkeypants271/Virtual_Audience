"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── Text-to-Speech (OpenAI Nova) ─────────────────────────────────────────────

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Always supported — uses our server-side API route
  const isSupported = true;

  // Stop audio when the component using this hook unmounts (e.g. navigating away from chat)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (isMuted || !text.trim()) return;

      // Stop any in-progress speech
      stop();

      setIsSpeaking(true);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error("TTS request failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          URL.revokeObjectURL(url);
          objectUrlRef.current = null;
          audioRef.current = null;
          setIsSpeaking(false);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
        };

        await audio.play();
      } catch {
        setIsSpeaking(false);
      }
    },
    [isMuted, stop]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      if (!m) stop();
      return !m;
    });
  }, [stop]);

  return { isSpeaking, isMuted, isSupported, speak, stop, toggleMute };
}

// ─── Speech-to-Text ────────────────────────────────────────────────────────────

type STTCallback = (finalTranscript: string) => void;

export function useSTT() {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SR);
    }
  }, []);

  const startListening = useCallback(
    (onFinal: STTCallback) => {
      if (typeof window === "undefined") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;

      // Stop any existing session
      if (recognitionRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognitionRef.current as any).stop();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition: any = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += t;
          } else {
            interim += t;
          }
        }
        setInterimText(interim);
        if (final) {
          onFinal(final.trim());
          setInterimText("");
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    []
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
      setIsListening(false);
      setInterimText("");
    }
  }, []);

  return { isListening, interimText, isSupported, startListening, stopListening };
}
