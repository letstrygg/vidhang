import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL = 'https://fnwmtytnltmqjaflfwyr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_y12qZF_dSbUPmV_aieiUgA_CibDsxQV'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)