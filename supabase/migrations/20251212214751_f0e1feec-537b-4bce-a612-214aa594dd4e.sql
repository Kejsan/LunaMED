-- Add language_preference column to user_settings
ALTER TABLE public.user_settings 
ADD COLUMN language_preference TEXT DEFAULT 'en';