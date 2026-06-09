import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini if key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Static API Endpoint: Simulated Installed Android Applications
const SIMULATED_APPS = [
  { packageName: "com.instagram.android", appName: "Instagram", category: "Social Media", icon: "instagram", defaultUsageMin: 140 },
  { packageName: "com.zhiliaoapp.musically", appName: "TikTok", category: "Social Media", icon: "video", defaultUsageMin: 185 },
  { packageName: "com.reddit.frontpage", appName: "Reddit", category: "Entertainment", icon: "reddit", defaultUsageMin: 90 },
  { packageName: "com.google.android.youtube", appName: "YouTube", category: "Entertainment", icon: "youtube", defaultUsageMin: 120 },
  { packageName: "com.riotgames.wildrift", appName: "League of Legends: Wild Rift", category: "Gaming", icon: "gamepad", defaultUsageMin: 75 },
  { packageName: "com.supercell.clashofclans", appName: "Clash of Clans", category: "Gaming", icon: "swords", defaultUsageMin: 45 },
  { packageName: "com.facebook.katana", appName: "Facebook", category: "Social Media", icon: "facebook", defaultUsageMin: 80 },
  { packageName: "com.twitter.android", appName: "X (Twitter)", category: "Social Media", icon: "twitter", defaultUsageMin: 65 },
  { packageName: "com.tinder", appName: "Tinder", category: "Entertainment", icon: "heart", defaultUsageMin: 35 },
  { packageName: "com.netflix.mediaclient", appName: "Netflix", category: "Entertainment", icon: "tv", defaultUsageMin: 110 }
];

app.get("/api/apps", (req, res) => {
  res.json({ apps: SIMULATED_APPS });
});

// 2. Server-Side Gemini API call for customized daily motivational coaching context
app.post("/api/motivation", async (req, res) => {
  const { blockedApp, category, minutesSpent, hoursRemaining } = req.body;

  try {
    const ai = getGemini();
    const prompt = `You are an elite, empathetic, and slightly firm productivity coach and digital addiction expert.
System Task: Generate a short, highly persuasive and impactful sentence (maximum 2 sentences, 30 words max) helping the user resist the urge to open the blocked app "${blockedApp || 'Social Media'}" (under category: "${category || 'General distraction'}").
Context: The user set a Focus Vault lock session. They have ${hoursRemaining || 'some'} time left. Today they usually spend ${minutesSpent || 'over 2 hours'} on this category.
Vibe: Firm, highly motivating, respectful of their willpower, focus-shifting, and psychology-backed. Keep it human and real. Do not use any introductory phrases like "Here is your message: " or "Coach: " - output only the message text. Do not use hashtags or emojis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text || "Your future is being built in the hours you rescue today. Stay the course; the urge is temporary, but discipline is permanent.";
    res.json({ success: true, message: text.trim() });
  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    // Fallback motivating messages
    const fallbacks = [
      "The temporary discomfort of discipline is far better than the lingering pain of regret. Keep pushing forward.",
      `Every time you resist opening ${blockedApp || "this app"}, you are physically rewiring your brain for high performance.`,
      "Your willpower limit is just an illusion. You are in complete control of your digital world.",
      "Stay in the Vault. Focus is not the absence of distraction, but the absolute conquest of it."
    ];
    const message = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    res.json({ success: false, message, error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Note: Standard Express SPA fallback routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
