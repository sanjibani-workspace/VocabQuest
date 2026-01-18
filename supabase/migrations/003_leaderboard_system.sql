-- Season System
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_number INTEGER NOT NULL,
    title TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard Table
-- Tracks user scores per season
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    season_id UUID REFERENCES seasons(id), -- If null, assumes 'All Time' or Global? Usually strictly tied to season or global generic. 
    -- Let's make it flexible. If season_id is null, it's global all-time? 
    -- Or we just query user_profile for all-time.
    -- Let's use this for SEASONAL rankings.
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    wp_score INTEGER DEFAULT 0, -- Word Power Score
    rank INTEGER, -- Cached rank (updated periodically)
    rank_change INTEGER DEFAULT 0, -- Change since last update
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_id, user_id)
);

-- Daily Challenges (Future)
CREATE TABLE daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_date DATE UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leaderboards_season_score ON leaderboards(season_id, wp_score DESC);
CREATE INDEX idx_leaderboards_user ON leaderboards(user_id);

-- RLS Policies
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Everyone can read seasons
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);

-- Everyone can read leaderboards
CREATE POLICY "Public read leaderboards" ON leaderboards FOR SELECT USING (true);

-- Everyone can read daily challenges
CREATE POLICY "Public read daily challenges" ON daily_challenges FOR SELECT USING (true);

-- Only service role can insert/update (for now)
-- Users might update their own score via server functions, but usually handled by triggers or secure RPCs.
