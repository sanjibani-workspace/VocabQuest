'use client';

/**
 * Guest Progress Utility
 * Manages localStorage for guest trial sessions before signup
 */

const GUEST_PROGRESS_KEY = 'vocabquest_guest_progress';

export interface GuestWordState {
    wordId: string;
    term: string;
    isCorrect: boolean;
}

export interface GuestProgress {
    sessionNumber: number;
    xpEarned: number;
    wordsCompleted: GuestWordState[];
    completedAt: string;
    correctCount: number;
    totalCount: number;
}

/**
 * Save guest progress to localStorage
 */
export function saveGuestProgress(progress: GuestProgress): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error('Failed to save guest progress:', e);
    }
}

/**
 * Get guest progress from localStorage
 */
export function getGuestProgress(): GuestProgress | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(GUEST_PROGRESS_KEY);
        if (!stored) return null;
        return JSON.parse(stored) as GuestProgress;
    } catch (e) {
        console.error('Failed to load guest progress:', e);
        return null;
    }
}

/**
 * Clear guest progress from localStorage (call after sync)
 */
export function clearGuestProgress(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(GUEST_PROGRESS_KEY);
    } catch (e) {
        console.error('Failed to clear guest progress:', e);
    }
}

/**
 * Check if there is pending guest progress to sync
 */
export function hasGuestProgress(): boolean {
    return getGuestProgress() !== null;
}
