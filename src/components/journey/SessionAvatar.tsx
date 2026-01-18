import React from 'react';
import Image from 'next/image';

interface SessionAvatarProps {
    sessionNumber: number;
    title: string;
    isCurrent?: boolean;
    isCompleted?: boolean;
    isLocked?: boolean;
    progress?: number;
    imageUrl?: string;
}

export default function SessionAvatar({
    sessionNumber,
    title,
    isCurrent = false,
    isCompleted = false,
    isLocked = false,
    progress = 0,
    imageUrl
}: SessionAvatarProps) {
    const size = isCurrent ? 120 : 80;
    const ringClass = isCurrent ? 'ring-4 ring-[var(--accent-gold)] shadow-[0_0_20px_rgba(244,197,66,0.5)]' : '';
    const completedClass = isCompleted ? 'ring-2 ring-[var(--accent-success)]' : '';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative ${isCurrent ? 'animate-pulse' : ''}`}>
                {/* Avatar Circle */}
                <div
                    className={`
            rounded-full overflow-hidden
            ${ringClass} ${completedClass}
            ${isLocked ? 'opacity-40 grayscale' : ''}
            transition-all duration-300
          `}
                    style={{ width: size, height: size }}
                >
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            width={size}
                            height={size}
                            className="object-cover"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-4xl font-bold"
                            style={{
                                background: `linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)`,
                                color: isLocked ? 'var(--text-muted)' : 'var(--accent-teal)'
                            }}
                        >
                            {sessionNumber}
                        </div>
                    )}
                </div>

                {/* Progress Ring Overlay (for current session) */}
                {isCurrent && progress > 0 && (
                    <svg
                        className="absolute top-0 left-0 transform -rotate-90"
                        width={size}
                        height={size}
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={(size - 8) / 2}
                            fill="none"
                            stroke="var(--accent-gold)"
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * ((size - 8) / 2)}`}
                            strokeDashoffset={`${2 * Math.PI * ((size - 8) / 2) * (1 - progress / 100)}`}
                            opacity="0.6"
                        />
                    </svg>
                )}

                {/* Completed Checkmark */}
                {isCompleted && (
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-success)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M13.3 4.3L6 11.6L2.7 8.3"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}

                {/* Lock Icon */}
                {isLocked && (
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M17 11V7C17 4.791 15.209 3 13 3H11C8.791 3 7 4.791 7 7V11M8 11H16C17.105 11 18 11.895 18 13V19C18 20.105 17.105 21 16 21H8C6.895 21 6 20.105 6 19V13C6 11.895 6.895 11 8 11Z"
                                stroke="var(--text-muted)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                )}

                {/* Current Session Badge */}
                {isCurrent && (
                    <div
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap"
                        style={{
                            background: 'var(--accent-gold)',
                            color: 'var(--bg-primary)',
                            boxShadow: 'var(--shadow-glow)'
                        }}
                    >
                        CURRENT
                    </div>
                )}
            </div>

            {/* Session Title */}
            <div className="text-center max-w-[140px]">
                <div
                    className="text-xs uppercase tracking-wide mb-1"
                    style={{ color: 'var(--text-muted)' }}
                >
                    Session {sessionNumber < 10 ? `0${sessionNumber}` : sessionNumber}
                </div>
                <div
                    className="font-bold text-sm"
                    style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)' }}
                >
                    {title}
                </div>
                {isCurrent && progress > 0 && (
                    <div
                        className="text-xs mt-1"
                        style={{ color: 'var(--accent-gold)' }}
                    >
                        {progress}% Progress
                    </div>
                )}
                {isCompleted && (
                    <div
                        className="text-xs mt-1"
                        style={{ color: 'var(--accent-success)' }}
                    >
                        Mastered
                    </div>
                )}
            </div>
        </div>
    );
}
