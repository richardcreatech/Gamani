// A curated pool of "seed" artists used to make Discover results
// feel intentional rather than random. This list is normally
// populated by an AI recommendation call on startup (and refreshed
// periodically) — the static list below is only a fallback in case
// that call fails or hasn't resolved yet.

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const FALLBACK_ARTISTS = [
  "Taylor Swift",
  "Ariana Grande",
  "Beyoncé",
  "Drake",
  "Bad Bunny",
  "The Weeknd",
  "Billie Eilish",
  "Kendrick Lamar",
  "Dua Lipa",
  "Harry Styles",
  "SZA",
  "Travis Scott",
  "Olivia Rodrigo",
  "Post Malone",
  "Doja Cat",
  "Rihanna",
  "Bruno Mars",
  "Adele",
  "Ed Sheeran",
  "J Balvin",
  "BTS",
  "Karol G",
  "Lana Del Rey",
  "Frank Ocean",
];

export let seedArtists = [...FALLBACK_ARTISTS];

let recentPicks = [];

const getRecentWindow = () => Math.min(5, seedArtists.length - 1);

export const getRandomSeedArtist = () => {
  const pool = seedArtists.filter((artist) => !recentPicks.includes(artist));
  const candidates = pool.length > 0 ? pool : seedArtists;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  recentPicks.push(pick);
  if (recentPicks.length > getRecentWindow()) {
    recentPicks.shift();
  }

  return pick;
};

// Ask Gemini for a fresh, varied pool of real, currently active
// artists spanning different genres — used to keep Discover feeling
// intentional rather than pulling from a fixed static list forever.
const fetchAiArtistList = async () => {
  try {
    const prompt = `
List 25 real, currently active, well-known artists on Spotify, spanning a
mix of genres (pop, hip-hop, latin, r&b, k-pop, indie, country, electronic, etc).
Respond with ONLY a JSON array of artist name strings, nothing else — no
markdown, no explanation, no code fences.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) return;

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      seedArtists = parsed.filter((name) => typeof name === "string");
      recentPicks = [];
    }
  } catch (error) {
    console.error(
      "Failed to fetch AI seed artist list, keeping current list:",
      error.message,
    );
  }
};

fetchAiArtistList();

const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
setInterval(fetchAiArtistList, REFRESH_INTERVAL_MS);