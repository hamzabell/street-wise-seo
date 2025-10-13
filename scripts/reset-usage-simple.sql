-- Reset usage data for testing purposes
-- This script clears all usage-related data to give fresh limits for testing

-- Delete usage tracking records
DELETE FROM usage_tracking;

-- Delete topic generations (these count toward usage)
DELETE FROM topic_generations;

-- Delete saved topics
DELETE FROM saved_topics;

-- Reset auto-increment counters (optional)
DELETE FROM sqlite_sequence WHERE name IN ('usage_tracking', 'topic_generations', 'saved_topics');

-- Show how many records were deleted
SELECT 'Usage data reset successfully!' as status;