import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://etsldmkjaniejslehqtw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0c2xkbWtqYW5pZWpzbGVocXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1ODY1OTMsImV4cCI6MjA1NDE2MjU5M30.7AGHCvJsR2eRiqCaQRGFhw4XqeIUyaRdDQ7MJ4qItdY'


export const supabase = createClient(supabaseUrl, supabaseAnonKey);