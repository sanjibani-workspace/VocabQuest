'use client';

import { useState, useRef, useEffect } from 'react';

interface PronunciationButtonProps {
    word: string;
    phonetic?: string; // Prop from DB
    className?: string;
    autoPlay?: boolean;
}

interface DictionaryData {
    word: string;
    phonetic?: string;
    phonetics: Array<{
        text?: string;
        audio?: string;
    }>;
}

export default function PronunciationButton({ word, phonetic: initialPhonetic, className = '', autoPlay = false }: PronunciationButtonProps) {
    const [hasApiAudio, setHasApiAudio] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [phonetic, setPhonetic] = useState<string | null>(initialPhonetic || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchAudio = async () => {
            if (!word) return;

            // Reset state - keep initialPhonetic if available
            setAudioUrl(null);
            setPhonetic(initialPhonetic || null);
            setHasApiAudio(false);

            try {
                // 1. Try Free Dictionary API first (best quality, human recorded)
                const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

                let foundAudio = false;

                if (response.ok) {
                    const data: DictionaryData[] = await response.json();
                    if (data.length > 0) {
                        const entry = data[0];
                        const phoneticWithAudio = entry.phonetics.find((p: { audio?: string; text?: string }) => p.audio && p.audio.length > 0);

                        if (mounted) {
                            if (phoneticWithAudio?.audio) {
                                setAudioUrl(phoneticWithAudio.audio);
                                setHasApiAudio(true);
                                foundAudio = true;
                            }
                            // Prefer API phonetic if available, else keep DB phonetic
                            const apiPhonetic = phoneticWithAudio?.text || entry.phonetic;
                            if (apiPhonetic) {
                                setPhonetic(apiPhonetic);
                            }
                        }
                    }
                }
                // ...

                // 2. Fallback to Google TTS (proxied) if no Dictionary audio found
                if (!foundAudio && mounted) {
                    const ttsUrl = `/api/tts?word=${encodeURIComponent(word)}`;
                    setAudioUrl(ttsUrl);
                    setHasApiAudio(false);
                }

            } catch (err) {
                // Fallback to proxy on network error
                if (mounted) {
                    const ttsUrl = `/api/tts?word=${encodeURIComponent(word)}`;
                    setAudioUrl(ttsUrl);
                }
            }
        };

        fetchAudio();

        return () => {
            mounted = false;
        };
    }, [word]);

    // Auto-play effect
    useEffect(() => {
        if (autoPlay && audioUrl) {
            // Wait a tiny bit for data to load, then play
            const timer = setTimeout(() => {
                playAudio();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [word, autoPlay, audioUrl]);

    const handleAudioError = () => {
        // Silently fail if audio element error
        setAudioUrl(null);
        setIsPlaying(false);
    };

    const playAudio = () => {
        if (audioRef.current && audioUrl && !audioRef.current.error) {
            setIsPlaying(true);
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .catch(e => {
                        if (e.name !== 'AbortError') {
                            // Suppress errors, just stop playing
                            console.error('Audio playback failed', e);
                            handleAudioError();
                        } else {
                            setIsPlaying(false);
                        }
                    });
            }
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={playAudio}
                disabled={isPlaying}
                className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all border-2
                    ${isPlaying
                        ? 'bg-violet-500 text-white border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.6)] scale-110'
                        : 'bg-gray-800 text-violet-400 border-gray-700 hover:border-violet-500 hover:text-white hover:bg-gray-700'
                    }
                `}
                title="Play pronunciation"
            >
                {isPlaying ? (
                    <div className="flex gap-0.5 h-3 items-center">
                        <div className="w-1 bg-current rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 bg-current rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 bg-current rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]" style={{ animationDelay: '300ms' }}></div>
                    </div>
                ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                )}
            </button>

            {phonetic && (
                <span className="text-sm text-gray-400 font-mono tracking-wide">
                    {phonetic}
                </span>
            )}

            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onError={handleAudioError}
                    className="hidden"
                />
            )}
        </div>
    );
}
