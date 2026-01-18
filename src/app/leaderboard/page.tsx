import { getLeaderboard } from '@/app/actions/leaderboard';
import { Trophy, Medal, User } from 'lucide-react';

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboard();

    return (
        <main className="min-h-screen pb-24 pt-8 px-4">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-teal-400">
                    Leaderboard
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Season 1 • Ends in 6d 12h</p>
            </div>

            {/* Podium (Top 3) - Could be enhanced later, for now simply part of list or separate */}

            {/* List */}
            <div className="max-w-lg mx-auto space-y-3">
                {leaderboard.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        No scholars found yet. Start the journey!
                    </div>
                ) : (
                    leaderboard.map((entry) => (
                        <div
                            key={entry.userId}
                            className={`relative flex items-center p-4 rounded-xl border transition-all ${entry.isCurrentUser
                                    ? 'bg-teal-900/30 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                                    : 'bg-slate-900/40 border-slate-800'
                                }`}
                        >
                            {/* Rank */}
                            <div className="w-10 flex-shrink-0 flex justify-center font-bold text-lg">
                                {entry.rank === 1 && <Trophy size={24} className="text-yellow-400" fill="currentColor" />}
                                {entry.rank === 2 && <Medal size={24} className="text-gray-300" fill="currentColor" />}
                                {entry.rank === 3 && <Medal size={24} className="text-amber-600" fill="currentColor" />}
                                {entry.rank > 3 && <span className="text-slate-400">#{entry.rank}</span>}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4 border border-slate-700">
                                <User size={20} className="text-slate-400" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold truncate ${entry.isCurrentUser ? 'text-teal-300' : 'text-slate-200'}`}>
                                    {entry.fullName}
                                </h3>
                                <div className="text-xs text-slate-400">
                                    Level {entry.level} Scholar
                                </div>
                            </div>

                            {/* XP */}
                            <div className="text-right">
                                <div className="font-bold text-amber-400">{entry.xpTotal.toLocaleString()}</div>
                                <div className="text-[10px] text-amber-500/70 uppercase font-bold tracking-wider">WP Score</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
