'use server';

import { createClient } from '@/lib/supabase/server';
import { recordActivity } from './streak';
import { logger } from '@/lib/logger';
import { DEFAULT_SM2_STATE } from '@/lib/sm2';

export interface GuestWordData {
    wordId: string;
    term: string;
    isCorrect: boolean;
}

export interface GuestProgressData {
    sessionNumber: number;
    xpEarned: number;
    wordsCompleted: GuestWordData[];
    completedAt: string;
    correctCount: number;
    totalCount: number;
}

/**
 * Sync guest progress from localStorage to database after signup
 */
export async function syncGuestProgress(data: GuestProgressData): Promise<{
    success: boolean;
    message?: string;
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    try {
        logger.info('guest.syncGuestProgress', 'Starting guest progress sync', {
            userId: user.id,
            sessionNumber: data.sessionNumber,
            wordsCount: data.wordsCompleted.length
        });

        // 1. Get Session 1 ID from database
        const { data: session } = await supabase
            .from('sessions')
            .select('id')
            .eq('session_number', data.sessionNumber)
            .single();

        if (!session) {
            logger.error('guest.syncGuestProgress', 'Session not found', null, { sessionNumber: data.sessionNumber });
            return { success: false, message: 'Session not found' };
        }

        // 2. Mark session as completed (if not already)
        const { error: progressError } = await supabase
            .from('user_session_progress')
            .upsert({
                user_id: user.id,
                session_id: session.id,
                completed_at: data.completedAt
            }, {
                onConflict: 'user_id,session_id'
            });

        if (progressError) {
            logger.error('guest.syncGuestProgress', 'Failed to save session progress', progressError, { userId: user.id });
        }

        // 3. Create word states for each word
        for (const word of data.wordsCompleted) {
            // Calculate initial SM2 state based on correctness
            const intervalDays = data.wordsCompleted.some(w => w.wordId === word.wordId && !w.isCorrect) ? 1 : 1;
            const dueAt = new Date();
            dueAt.setDate(dueAt.getDate() + intervalDays);

            await supabase
                .from('user_word_state')
                .upsert({
                    user_id: user.id,
                    word_id: word.wordId,
                    repetitions: 1,
                    interval_days: intervalDays,
                    ease_factor: DEFAULT_SM2_STATE.easeFactor,
                    due_at: dueAt.toISOString(),
                    last_reviewed_at: data.completedAt,
                    lapses: word.isCorrect ? 0 : 1
                }, {
                    onConflict: 'user_id,word_id'
                });
        }

        // 4. Update XP
        const { data: profile } = await supabase
            .from('user_profile')
            .select('xp_total')
            .eq('user_id', user.id)
            .single();

        const currentXp = profile?.xp_total ?? 0;
        const newXp = currentXp + data.xpEarned;
        const newLevel = Math.floor(newXp / 500) + 1;

        await supabase
            .from('user_profile')
            .update({ xp_total: newXp, level: newLevel })
            .eq('user_id', user.id);

        // 5. Record activity to start streak
        const localDate = new Date().toLocaleDateString('en-CA');
        await recordActivity('session', localDate);

        logger.info('guest.syncGuestProgress', 'Guest progress synced successfully', {
            userId: user.id,
            xpSynced: data.xpEarned,
            wordsSynced: data.wordsCompleted.length
        });

        return { success: true };
    } catch (error) {
        logger.error('guest.syncGuestProgress', 'Failed to sync guest progress', error as Error, { userId: user.id });
        return { success: false, message: 'Sync failed' };
    }
}
