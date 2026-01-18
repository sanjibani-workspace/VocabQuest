'use server';

import { createClient } from '@/lib/supabase/server';
import { DbUserProfile } from '@/lib/types';

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    fullName: string;
    avatarUrl?: string;
    xpTotal: number;
    level: number;
    isCurrentUser: boolean;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Fetch all profiles sorted by XP
    // Note: In production with millions of users, this needs pagination or a dedicated materialized view.
    // For MVP, fetching top 50 is fine.
    const { data: profiles, error } = await supabase
        .from('user_profile')
        .select('*')
        .order('xp_total', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    if (!profiles) return [];

    // Since we don't have user_metadata in user_profile table (it's in auth.users which is restricted),
    // and we can't join auth.users easily without elevated privileges or a public view.
    // We might need to assume 'Scholar' or fetch public profile info if we stored it.
    // Wait, `user_profile` usually doesn't have name.
    // `auth.users` has metadata.
    // If we can't join, we can't show names easily unless we made a public profiles table.
    // BUT `getUserStats` used `supabase.auth.getUser()` which only gets CURRENT user.
    // To show OTHER users' names, we need a public profile table or column in `user_profile`.
    // FOR MVP: We will use potentially fake names or just "Scholar #ID" if we can't get names.
    // OR: Check if `user_profile` has a name column? 
    // Types says: `user_id, xp_total, level, created_at`. No name.

    // Proposal: Add `display_name` to `user_profile`? We can't migrate DB.
    // Workaround: Show "Scholar" + truncated ID, or "You" for current user.

    return profiles.map((profile, index) => ({
        rank: index + 1,
        userId: profile.user_id,
        fullName: profile.user_id === currentUser?.id ? 'You' : `Scholar ${profile.user_id.substring(0, 4)}`,
        xpTotal: profile.xp_total,
        level: profile.level,
        isCurrentUser: profile.user_id === currentUser?.id
    }));
}
