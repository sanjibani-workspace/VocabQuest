'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface GuestSignupPromptProps {
    wordsLearned: number;
    xpEarned: number;
    accuracy: number;
}

export default function GuestSignupPrompt({
    wordsLearned,
    xpEarned,
    accuracy
}: GuestSignupPromptProps) {
    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <Card variant="glass" className="text-center max-w-lg w-full">
                <div className="py-8">
                    {/* Celebration Animation */}
                    <div className="relative mb-6">
                        <span className="text-7xl block animate-bounce">🎉</span>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-violet-500/20 to-amber-500/20 rounded-full blur-3xl -z-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-3">
                        Amazing Progress!
                    </h2>

                    <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                        You just learned <span className="text-emerald-400 font-bold">{wordsLearned} new words</span>!
                        <br />
                        Create a free account to keep your streak alive and unlock Session 2.
                    </p>

                    {/* Stats Preview */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>
                                +{xpEarned}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                XP Earned
                            </div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="text-3xl font-bold" style={{ color: 'var(--accent-success)' }}>
                                {accuracy}%
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Accuracy
                            </div>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)' }}>
                            <div className="text-3xl font-bold" style={{ color: 'var(--accent-teal)' }}>
                                {wordsLearned}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Words
                            </div>
                        </div>
                    </div>

                    {/* Warning about losing progress */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8">
                        <p className="text-amber-200 text-sm">
                            ⚠️ Your progress will be lost if you leave without signing up!
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-4">
                        <Link href="/login?next=/home&syncGuest=true" className="block">
                            <Button className="w-full text-lg py-4">
                                🚀 Create Free Account
                            </Button>
                        </Link>
                        <Link href="/login?next=/home&syncGuest=true" className="block">
                            <Button variant="secondary" className="w-full">
                                Already have an account? Sign In
                            </Button>
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <p className="text-xs text-gray-500 mt-6">
                        ✓ Free forever &nbsp;•&nbsp; ✓ No credit card required &nbsp;•&nbsp; ✓ 10 second signup
                    </p>
                </div>
            </Card>
        </main>
    );
}
