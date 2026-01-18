'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SessionNode from './SessionNode';

interface Session {
    session_number: number;
    title: string;
    is_completed?: boolean;
    progress?: number;
}

interface JourneyTimelineProps {
    sessions: Session[];
    currentSessionNumber: number;
    totalXP: number;
}

export default function JourneyTimeline({
    sessions,
    currentSessionNumber,
    totalXP
}: JourneyTimelineProps) {
    const router = useRouter();

    const handleSessionClick = (sessionNumber: number) => {
        router.push(`/quest/${sessionNumber}`);
    };

    // Calculate mastery progress (total XP / estimated XP needed)
    const masteryProgress = Math.min(100, Math.floor((totalXP / 10000) * 100));

    return (
        <div className="flex flex-col items-center py-8 px-4">
            {/* Mastery Progress Header */}
            <div
                className="w-full max-w-md mb-8 p-6 rounded-2xl"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                <div
                    className="text-xs uppercase tracking-wide mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    MASTERY PROGRESS
                </div>
                <div
                    className="text-4xl font-bold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {totalXP.toLocaleString()} <span className="text-lg font-normal" style={{ color: 'var(--text-secondary)' }}>XP TOTAL</span>
                </div>

                {/* Progress Bar */}
                <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-elevated)' }}
                >
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${masteryProgress}%`,
                            background: 'linear-gradient(90deg, var(--accent-teal) 0%, var(--accent-success) 100%)'
                        }}
                    />
                </div>
            </div>

            {/* Session Timeline */}
            <div className="flex flex-col items-center space-y-0">
                {sessions.map((session, index) => {
                    const isCurrent = session.session_number === currentSessionNumber;
                    const isCompleted = session.is_completed || session.session_number < currentSessionNumber;
                    const isLocked = session.session_number > currentSessionNumber;
                    const progress = session.progress || 0;

                    return (
                        <SessionNode
                            key={session.session_number}
                            sessionNumber={session.session_number}
                            title={session.title}
                            isCurrent={isCurrent}
                            isCompleted={isCompleted}
                            isLocked={isLocked}
                            progress={progress}
                            onSessionClick={() => handleSessionClick(session.session_number)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
