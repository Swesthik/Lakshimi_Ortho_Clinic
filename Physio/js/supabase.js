/**
 * ReviveCMS - Supabase Client Static Initialization
 * Initializes the client exactly once globally from the statically loaded SDK.
 */

import { CONFIG } from './config.js';
import { Logger } from './logger.js';

let supabaseClient = null;

if (window.supabase) {
  try {
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_URL.includes('your-project')) {
      supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      window.supabaseClient = supabaseClient;
      Logger.info('Supabase', 'Supabase client initialized successfully.');
    } else {
      Logger.warn('Supabase', 'Using placeholder configuration. Client initialized but auth requests may fail.');
      supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
  } catch (err) {
    Logger.error('Supabase', 'Failed to initialize Supabase Client: ' + err.message);
  }
} else {
  Logger.error('Supabase', 'Supabase SDK not loaded on window. Static CDN script load tag must be present.');
}

export const supabase = supabaseClient;
