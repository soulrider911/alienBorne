export async function fetchLeaderboard() {
  const res = await fetch('/api/highscores');
  if (!res.ok) throw new Error(`fetchLeaderboard failed: ${res.status}`);
  return res.json();
}

export async function submitScore(initials, score) {
  const res = await fetch('/api/highscores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initials, score }),
  });
  if (!res.ok) throw new Error(`submitScore failed: ${res.status}`);
  return res.json();
}
