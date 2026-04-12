"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/lib/types";
import { useTTS, useSTT } from "@/hooks/useSpeech";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInterface({
  messages,
  onSend,
  isLoading,
  placeholder = "Type your response...",
  disabled = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenIndexRef = useRef(-1);

  const { isSpeaking, isMuted, isSupported: ttsSupported, speak, stop: stopTTS, toggleMute } = useTTS();
  const { isListening, interimText, isSupported: sttSupported, startListening, stopListening } = useSTT();

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!ttsSupported || isMuted) return;
    const assistantMessages = messages
      .map((m, i) => ({ msg: m, index: i }))
      .filter(({ msg }) => msg.role === "assistant");
    if (assistantMessages.length === 0) return;
    const latest = assistantMessages[assistantMessages.length - 1];
    if (latest.index > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = latest.index;
      speak(latest.msg.content);
    }
  }, [messages, ttsSupported, isMuted, speak]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading || disabled) return;
      stopTTS();
      onSend(text);
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    },
    [input, isLoading, disabled, onSend, stopTTS]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleMicClick = useCallback(() => {
    stopTTS();
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setInput((prev) => {
          const updated = prev ? `${prev} ${transcript}` : transcript;
          // Resize textarea after state settles
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.style.height = "auto";
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
            }
          }, 0);
          return updated;
        });
      });
    }
  }, [isListening, startListening, stopListening, stopTTS]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages header row with mute toggle */}
      {ttsSupported && (
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleMute}
            title={isMuted ? "Unmute voice" : "Mute voice"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
              isMuted
                ? "bg-neutral-800 text-neutral-500 border border-neutral-700"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isMuted ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Voice off
              </>
            ) : (
              <>
                <svg
                  className={`w-3.5 h-3.5 ${isSpeaking ? "animate-pulse" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                {isSpeaking ? "Speaking..." : "Voice on"}
              </>
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                <span className="text-amber-400 text-xs font-bold">VA</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-neutral-700 text-neutral-100 rounded-tr-sm"
                  : "bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-amber-400 text-xs font-bold">VA</span>
            </div>
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!disabled && (
        <div className="mt-4 space-y-2">
          {/* Interim STT text */}
          {isListening && interimText && (
            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 italic animate-pulse">
              {interimText}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : placeholder}
              rows={1}
              className={`w-full bg-neutral-800 border rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none transition-all ${
                isListening
                  ? "border-amber-500/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 pr-24"
                  : "border-neutral-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 pr-24"
              }`}
              disabled={isLoading}
            />

            {/* Button group: mic + send */}
            <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
              {/* Mic button */}
              {sttSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isLoading}
                  title={isListening ? "Stop recording" : "Speak your answer"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 hover:bg-red-400 text-white animate-pulse"
                      : "bg-neutral-700 hover:bg-neutral-600 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {isListening ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 disabled:text-neutral-500 rounded-lg flex items-center justify-center transition-colors text-neutral-900"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </form>

          {sttSupported && (
            <p className="text-xs text-neutral-600 text-center">
              {isListening ? "Tap the red button to stop recording" : "Click the mic to speak your answer"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
