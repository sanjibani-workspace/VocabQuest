'use server';

import { createClient, getUser } from '@/lib/supabase/server';

export async function getAllSessionsProgress() {
    const supabase = await createClient();
    const user = await getUser();

    if (!user) {
        throw new Error('Must be signed in to get sessions progress');
    }

    // Get all sessions
    const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_number, title')
        .order('session_number');

    if (sessionsError) {
        throw sessionsError;
    }

    // Get completed sessions for this user
    const { data: completedSessions, error: progressError } = await supabase
        .from('user_session_progress')
        .select('session_id, sessions(session_number)')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

    if (progressError) {
        throw progressError;
    }

    // Extract session numbers from completed sessions
    const completedSet = new Set(
        completedSessions
            ?.map(s => (s.sessions as any)?.session_number)
            .filter(Boolean) || []
    );

    // Add completion status to sessions
    return sessions.map(session => ({
        ...session,
        is_completed: completedSet.has(session.session_number),
        progress: 0 // We can add actual in-progress tracking later
    }));
}
