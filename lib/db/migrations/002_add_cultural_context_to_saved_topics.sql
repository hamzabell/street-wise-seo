-- Add cultural context fields to saved_topics table
ALTER TABLE saved_topics
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'english',
ADD COLUMN IF NOT EXISTS formality_level TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS content_purpose TEXT DEFAULT 'marketing',
ADD COLUMN IF NOT EXISTS brand_voice_analysis TEXT,
ADD COLUMN IF NOT EXISTS business_offerings TEXT,
ADD COLUMN IF NOT EXISTS competitor_intelligence TEXT,
ADD COLUMN IF NOT EXISTS cultural_context TEXT,
ADD COLUMN IF NOT EXISTS market_positioning TEXT,
ADD COLUMN IF NOT EXISTS context_weights TEXT,
ADD COLUMN IF NOT EXISTS additional_context TEXT;