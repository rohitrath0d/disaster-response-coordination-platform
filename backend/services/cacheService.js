import { supabase } from '../supabase/client.js';

export const getCachedValue = async (key) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('cache')
    .select('value')
    .eq('key', key)
    .gt('expires_at', now)
    .single();

  if (error) return null;
  return data.value;
};

export const setCacheValue = async (key, value, ttlSeconds = 3600) => {
  
  const expires = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await supabase
    .from('cache')
    .upsert({ key, value, expires_at: expires });
};
