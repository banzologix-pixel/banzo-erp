import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwwyxqyiffvhnnljyufq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3l4cXlpZmZ2aG5ubGp5dWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjAyMDcsImV4cCI6MjA4MjU5NjIwN30.YJP44GkSDojTv53DKqBNfOLvey6YR7ihKNyzwvv3j5k';

export const supabase = createClient(supabaseUrl, supabaseKey);

