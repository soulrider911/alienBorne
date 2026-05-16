const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('high_scores')
      .select('initials, score, created_at')
      .order('score', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const rawInitials = typeof body?.initials === 'string' ? body.initials.trim() : '';
    if (!/^[A-Za-z0-9]{1,3}$/.test(rawInitials)) {
      return res.status(400).json({ error: 'initials must be 1–3 alphanumeric characters' });
    }
    const initials = rawInitials.toUpperCase();

    const score = Number(body?.score);
    if (!Number.isInteger(score) || score < 0 || score > 9999999) {
      return res.status(400).json({ error: 'score must be a non-negative integer up to 9999999' });
    }

    const { data, error } = await supabase
      .from('high_scores')
      .insert({ initials, score })
      .select('initials, score, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
