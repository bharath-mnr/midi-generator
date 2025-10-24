-- Add source column to midi_generations
ALTER TABLE midi_generations
ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'web';

-- Add source column to chat_histories
ALTER TABLE chat_histories
ADD COLUMN IF NOT EXISTS source VARCHAR(10) DEFAULT 'web';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_midi_gen_source ON midi_generations(user_id, source);
CREATE INDEX IF NOT EXISTS idx_chat_hist_source ON chat_histories(user_id, source);