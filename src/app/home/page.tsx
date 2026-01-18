import Link from 'next/link';
import { getUserStats } from '@/app/actions/user';
import { getNextSession } from '@/app/actions/quest';
import { getStreakData } from '@/app/actions/streak';
import { getAllSessionsProgress } from '@/app/actions/sessions';
import JourneyTimeline from '@/components/journey/JourneyTimeline';
import CharacterEvolution from '@/components/game/CharacterEvolution';

export default async function HomePage() {
    // Parallelize page load data fetching
    const [stats, nextSession, streakData, sessions] = await Promise.all([
        getUserStats(),
        getNextSession(),
        getStreakData(),
        getAllSessionsProgress()
    ]);

    return (
        <main className="min-h-screen">
            {/* Header */}
            <header
                className="px-6 py-4 flex items-center justify-between"
                style={{
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-subtle)'
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--accent-teal)' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div>
                        <div
                            className="text-xs uppercase tracking-wide"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            JOURNEY
                        </div>
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            Lexicon III
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Streak Badge */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(244, 197, 66, 0.2)' }}
                        >
                            <span style={{ color: 'var(--accent-gold)' }}>🔥</span>
                        </div>
                        <span className="font-bold" style={{ color: 'var(--accent-gold)' }}>
                            {streakData?.currentStreak ?? 0}
                        </span>
                    </div>

                    {/* XP */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(26, 155, 168, 0.2)' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M12 2L2 7L12 12L22 7L12 2Z"
                                    stroke="var(--accent-teal)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 17L12 22L22 17"
                                    stroke="var(--accent-teal)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M2 12L12 17L22 12"
                                    stroke="var(--accent-teal)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <span className="font-bold" style={{ color: 'var(--accent-teal)' }}>
                            {stats?.xpTotal ?? 0}
                        </span>
                    </div>
                </div>
            </header>

            {/* Journey Timeline */}
            <JourneyTimeline
                sessions={sessions}
                currentSessionNumber={nextSession?.session_number ?? 1}
                totalXP={stats?.xpTotal ?? 0}
            />

            {/* Floating Action Button - Play Current Session */}
            {nextSession && (
                <Link href={`/quest/${nextSession.session_number}`}>
                    <button
                        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-teal) 0%, #15868f 100%)',
                            boxShadow: '0 8px 16px rgba(26, 155, 168, 0.4)'
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M5 3l14 9-14 9V3z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </Link>
            )}

            {/* Character Evolution - Floating Display */}
            <div
                className="fixed bottom-8 left-8 p-4 rounded-2xl"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)'
                }}
            >
                <CharacterEvolution
                    stage={streakData?.characterStage ?? 1}
                    size="small"
                />
            </div>
        </main>
    );
}
