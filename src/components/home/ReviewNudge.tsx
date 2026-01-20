'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ReviewNudgeProps {
    dueCount: number;
}

export default function ReviewNudge({ dueCount }: ReviewNudgeProps) {
    if (dueCount === 0) return null;

    return (
        <div className="w-full max-w-2xl mx-auto px-4 mb-8 pt-4">
            <div className="animate-bounce-gentle">
                <Card
                    variant="glass"
                    className="relative overflow-hidden border-violet-500/30 bg-violet-900/10 backdrop-blur-md"
                >
                    {/* Background Pulse Effect */}
                    <div className="absolute inset-0 bg-violet-500/5 animate-pulse-slow" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40 shadow-lg shadow-violet-500/20">
                                <Sparkles className="text-violet-300 w-6 h-6 animate-pulse" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-bold text-white leading-tight">
                                    Time to Review!
                                </h3>
                                <p className="text-violet-200 text-sm">
                                    You have <span className="font-bold text-white">{dueCount} words</span> ready for review.
                                </p>
                            </div>
                        </div>

                        <Link href="/review">
                            <Button
                                variant="primary"
                                className="bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/20 group"
                            >
                                <span className="mr-2">Review Now</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
