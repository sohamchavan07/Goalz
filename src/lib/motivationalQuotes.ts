// Motivational quotes for daily display
export const MOTIVATIONAL_QUOTES = [
  "It always seems impossible until it’s done. — Nelson Mandela",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "You must be the change you wish to see in the world. — Mahatma Gandhi",
  "Whether you think you can or you think you can’t, you’re right. — Henry Ford",
  "Do what you can, with what you have, where you are. — Theodore Roosevelt",
  "The journey of a thousand miles begins with a single step. — Lao Tzu",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Dream big and dare to fail. — Norman Vaughan",
  "Try not to become a man of success, but rather become a man of value. — Albert Einstein",
  "Do one thing every day that scares you. — Eleanor Roosevelt",
  "The secret of getting ahead is getting started. — Mark Twain",
  "If opportunity doesn’t knock, build a door. — Milton Berle",
  "Everything you’ve ever wanted is on the other side of fear. — George Addair",
  "Don’t judge each day by the harvest you reap but by the seeds that you plant. — Robert Louis Stevenson",
  "Your time is limited, so don’t waste it living someone else’s life. — Steve Jobs",
  "Turn your wounds into wisdom. — Oprah Winfrey",
  "Start where you are. Use what you have. Do what you can. — Arthur Ashe",
  "Act as if what you do makes a difference. It does. — William James",
  "Happiness depends upon ourselves. — Aristotle",
  "The mind is everything. What you think you become. — Buddha",
  "You miss 100% of the shots you don’t take. — Wayne Gretzky",
  "Quality is not an act, it is a habit. — Aristotle",
  "Opportunities don't happen. You create them. — Chris Grosser",
  "Don’t watch the clock; do what it does. Keep going. — Sam Levenson",
  "What we think, we become. — Buddha",
  "Everything has beauty, but not everyone sees it. — Confucius",
  "Success usually comes to those who are too busy to be looking for it. — Henry David Thoreau",
  "Keep your face always toward the sunshine—and shadows will fall behind you. — Walt Whitman"
];

/**
 * Returns a daily motivational quote, changing every day but consistent for the same day.
 */
export function getDailyMotivationalQuote(date = new Date()): string {
  // Use UTC date to avoid timezone issues
  const start = new Date(Date.UTC(2026, 0, 1)); // Jan 1, 2026
  const today = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const idx = Math.abs(diffDays) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[idx];
}
