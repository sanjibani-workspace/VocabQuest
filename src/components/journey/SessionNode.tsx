import React from 'react';
import SessionAvatar from './SessionAvatar';

interface SessionNodeProps {
    sessionNumber: number;
    title: string;
    isCurrent?: boolean;
    isCompleted?: boolean;
    isLocked?: boolean;
    progress?: number;
    onSessionClick?: () => void;
}

export default function SessionNode({
    sessionNumber,
    title,
    isCurrent = false,
    isCompleted = false,
    isLocked = false,
    progress = 0,
    onSessionClick
}: SessionNodeProps) {
    return (
        <div className="flex flex-col items-center relative">
            {/* Timeline Connector Line (Above) */}
            {sessionNumber > 1 && (
                <div
                    className="w-0.5 h-16"
                    style={{ background: 'var(--border-emphasis)' }}
                />
            )}

            {/* Session Avatar */}
            <button
                onClick={isLocked ? undefined : onSessionClick}
                disabled={isLocked}
                className={`
          transition-transform duration-200
          ${!isLocked && 'hover:scale-105 cursor-pointer'}
          ${isLocked && 'cursor-not-allowed'}
        `}
            >
                <SessionAvatar
                    sessionNumber={sessionNumber}
                    title={title}
                    isCurrent={isCurrent}
                    isCompleted={isCompleted}
                    isLocked={isLocked}
                    progress={progress}
                />
            </button>

            {/* Timeline Connector Line (Below) */}
            <div
                className="w-0.5 h-16"
                style={{ background: 'var(--border-emphasis)' }}
            />
        </div>
    );
}
