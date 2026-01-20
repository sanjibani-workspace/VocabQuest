'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSessionByNumber, submitQuestAnswer, completeQuest } from '@/app/actions/quest';
import { recordActivity } from '@/app/actions/streak';
import { getUserStats } from '@/app/actions/user';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import QuizPrompt from '@/components/game/QuizPrompt';
import XPDisplay from '@/components/game/XPDisplay';
import { type QuestPrompt, type DbSession } from '@/lib/types';

interface QuestPageProps {
    params: Promise<{ sessionNumber: string }>;
}

export default function QuestPage({ params }: QuestPageProps) {
    const resolvedParams = use(params);
    const router = useRouter();
    const sessionNumber = parseInt(resolvedParams.sessionNumber, 10);

    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<DbSession | null>(null);
    const [prompts, setPrompts] = useState<QuestPrompt[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [xpTotal, setXpTotal] = useState(0);
    const [xpGained, setXpGained] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [bonusXP, setBonusXP] = useState(0);

    const [completionMessage, setCompletionMessage] = useState<string | null>(null);

    // Track pending server syncs to ensure data saves before completion
    const [pendingSyncs, setPendingSyncs] = useState<Promise<any>[]>([]);

    useEffect(() => {
        async function loadSessionAndStats() {
            try {
                // Parallel fetch for session and user stats
                const [sessionData, stats] = await Promise.all([
                    getSessionByNumber(sessionNumber),
                    getUserStats()
                ]);

                if (sessionData) {
                    setSession(sessionData.session);
                    setPrompts(sessionData.prompts);
                }

                if (stats) {
                    setXpTotal(stats.xpTotal);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadSessionAndStats();
    }, [sessionNumber]);

    const handleAnswer = async (selectedAnswer: string, isCorrect: boolean) => {
        const prompt = prompts[currentIndex];

        // Optimistic UI Update (Immediate feedback)
        // 1. Calculate expected XP
        const optimisticXpAward = isCorrect ? 10 : 2; // Hardcoded constants from types/logic
        const newOptimisticTotal = xpTotal + optimisticXpAward;

        // 2. Update local state immediately
        setXpTotal(newOptimisticTotal);
        setXpGained(optimisticXpAward);
        if (isCorrect) setCorrectCount(c => c + 1);

        // 3. Advance question (with small visual delay for user to see selection)
        // We keep the timeout to allow the user to see "Correct/Incorrect" fedback from the component
        const NEXT_QUESTION_DELAY = 1000; // 1 second to read feedback

        // However, we start the server request IMMEDIATELY in background
        // Track this promise so we can await all syncs before completion
        const serverRequest = submitQuestAnswer(prompt.wordId, isCorrect)
            .catch((err) => {
                console.error('Background sync failed:', err);
            });

        // Add to pending syncs
        setPendingSyncs(prev => [...prev, serverRequest]);

        // 4. Transition UI after delay
        setTimeout(() => {
            if (currentIndex < prompts.length - 1) {
                setCurrentIndex(i => i + 1);
                setXpGained(0);
            } else {
                handleComplete();
            }
        }, 800); // Reduced from previous implicit/longer wait
    };

    const handleComplete = async () => {
        if (!session) return;

        // CRITICAL: Wait for all word state syncs to complete FIRST
        // This ensures words are saved to DB so they appear in Review
        await Promise.all(pendingSyncs);

        // NOW show completion screen with bonus XP
        const estimatedBonusXP = 50; // Standard session bonus
        setBonusXP(estimatedBonusXP);
        setXpTotal(prev => prev + estimatedBonusXP);
        setIsComplete(true);

        // Calculate local date (YYYY-MM-DD) to ensure streak counts for user's day
        const now = new Date();
        const localDate = now.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD in local time

        // Background sync: Complete the quest and record activity in parallel
        Promise.all([
            completeQuest(session.id),
            recordActivity('session', localDate)
        ]).then(([questResult]) => {
            // Reconcile with server values if needed
            if (questResult) {
                if (!questResult.success && questResult.message) {
                    setCompletionMessage(questResult.message);
                }
                // Could update XP if server differs, but for optimistic UX we trust client
            }
        }).catch((error) => {
            console.error('Background sync failed:', error);
            // Could show toast notification for retry
        });
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-teal)', borderTopColor: 'transparent' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading quest...</p>
                </div>
            </main>
        );
    }

    if (!session || prompts.length === 0) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <Card variant="glass" className="text-center max-w-md">
                    <span className="text-6xl mb-4 block">🔍</span>
                    <h2 className="text-xl font-semibold text-white mb-2">Session Not Found</h2>
                    <p className="text-gray-400 mb-6">
                        This session doesn't exist or hasn't been published yet.
                    </p>
                    <Link href="/library">
                        <Button>Browse Sessions</Button>
                    </Link>
                </Card>
            </main>
        );
    }

    // Quest Complete Screen
    if (isComplete) {
        const accuracy = Math.round((correctCount / prompts.length) * 100);

        // If completion message exists, it means the user was blocked from completing the session
        // due to pending mistakes. Show a different UI.
        const isBlocked = !!completionMessage;

        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <Card variant="glass" className="text-center max-w-lg w-full">
                    <div className="py-8">
                        {isBlocked ? (
                            <>
                                <span className="text-7xl mb-6 block">🚧</span>
                                <h2 className="text-3xl font-bold text-white mb-2">Session Finished</h2>
                                <p className="text-xl text-amber-400 mb-8 font-semibold">But review required!</p>

                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8">
                                    <p className="text-amber-200 text-lg mb-2">
                                        {completionMessage}
                                    </p>
                                    <p className="text-sm text-amber-400/70">
                                        You must review your mistakes before this session can be marked as complete.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/home">
                                        <Button variant="secondary">Back to Dashboard</Button>
                                    </Link>
                                    <Link href="/review">
                                        <Button>Go to Review Now</Button>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-7xl mb-6 block animate-bounce">🎉</span>
                                <h2 className="text-3xl font-bold text-white mb-2">Quest Complete!</h2>
                                <p className="text-xl text-gray-400 mb-8">{session.title}</p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="text-3xl font-bold" style={{ color: 'var(--accent-success)' }}>{accuracy}%</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Accuracy</div>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>+{bonusXP}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bonus XP</div>
                                    </div>
                                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                                        <div className="text-3xl font-bold" style={{ color: 'var(--accent-teal)' }}>{prompts.length}</div>
                                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Words</div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-8">
                                    <p className="text-emerald-300">
                                        ✓ {prompts.length} words added to your review queue
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/home">
                                        <Button variant="secondary">Back to Home</Button>
                                    </Link>
                                    <Link href="/review">
                                        <Button>Start Review</Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </main>
        );
    }

    // Quest in Progress
    const currentPrompt = prompts[currentIndex];

    return (
        <main className="min-h-screen px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/home" className="text-sm" style={{ color: 'var(--accent-teal)' }}>
                            ← Exit Quest
                        </Link>
                        <div className="text-sm text-gray-400">
                            Session {session.session_number}
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>

                    {/* Progress */}
                    <div className="flex items-center gap-4">
                        <ProgressBar
                            value={currentIndex}
                            max={prompts.length}
                            showLabel
                            label={`Question ${currentIndex + 1} of ${prompts.length}`}
                        />
                    </div>
                </header>

                {/* XP Bar */}
                <div className="mb-8">
                    <XPDisplay
                        xp={xpTotal}
                        level={Math.floor(xpTotal / 500) + 1}
                        xpGained={xpGained}
                        showAnimation={xpGained > 0}
                    />
                </div>

                {/* Quiz Prompt */}
                <QuizPrompt
                    prompt={currentPrompt}
                    onAnswer={handleAnswer}
                />
            </div>
        </main>
    );
}
