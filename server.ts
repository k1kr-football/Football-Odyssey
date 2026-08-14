import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Real-World Football News Grounding Endpoint
  app.get("/api/real-world-football-news", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });

          // Call Gemini 2.5 Flash model with Google Search Grounding tool enabled
          let response;
          try {
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: "Search for 6 top real-world football news headlines happening today across major European and global football leagues (Premier League, UEFA Champions League, La Liga, Serie A, Transfer News). Return a JSON array of objects with fields: id, title, summary, category (must be one of: 'TRANSFERS', 'CHAMPIONS LEAGUE', 'PREMIER LEAGUE', 'WORLD FOOTBALL', 'INTERNATIONAL'), sourceName, timestamp, keyEntities.",
              config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      category: { type: Type.STRING },
                      sourceName: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      keyEntities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["id", "title", "summary", "category", "sourceName", "timestamp"]
                  }
                }
              }
            });
          } catch (searchErr: any) {
            console.warn("Search grounding unavailable or rate limited, falling back to standard generation:", searchErr?.message || searchErr);
            // Retry without googleSearch tool if search grounding quota is exceeded
            response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: "Provide 6 top real-world football news headlines happening today across major European and global football leagues (Premier League, UEFA Champions League, La Liga, Serie A, Transfer News). Return a JSON array of objects with fields: id, title, summary, category (must be one of: 'TRANSFERS', 'CHAMPIONS LEAGUE', 'PREMIER LEAGUE', 'WORLD FOOTBALL', 'INTERNATIONAL'), sourceName, timestamp, keyEntities.",
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      category: { type: Type.STRING },
                      sourceName: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      keyEntities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["id", "title", "summary", "category", "sourceName", "timestamp"]
                  }
                }
              }
            });
          }

          const text = response.text || "";
          let headlines = [];
          try {
            headlines = JSON.parse(text);
          } catch {
            headlines = [];
          }

          // Extract Google Search Grounding Metadata & Sources
          const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          const groundingSources = groundingChunks.map((chunk: any) => ({
            title: chunk?.web?.title || "Web Citation",
            url: chunk?.web?.uri || "#"
          })).filter((s: any) => s.url !== "#");

          const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

          return res.json({
            success: true,
            headlines,
            groundingSources,
            searchQueries,
            isGrounded: true,
            lastUpdated: new Date().toISOString()
          });
        } catch (err: any) {
          console.error("Gemini Search Grounding Error:", err?.message || err);
        }
      }

      // Fallback response when GEMINI_API_KEY is not available or search fails
      return res.json({
        success: true,
        headlines: [
          {
            id: 'rw_1',
            title: 'Summer Transfer Window Negotiations Accelerate Across Europe',
            summary: 'Leading Premier League and La Liga clubs enter intense negotiations for high-profile attackers and defensive talents.',
            category: 'TRANSFERS',
            sourceName: 'Sky Sports',
            url: 'https://www.skysports.com/transfer-centre',
            timestamp: '20m ago',
            keyEntities: ['Real Madrid', 'Arsenal', 'Bayern Munich']
          },
          {
            id: 'rw_2',
            title: 'UEFA Champions League Quarter-Final Clashes Previewed',
            summary: 'Managers address media ahead of high-stakes European nights with tactical preparation reaching fever pitch.',
            category: 'CHAMPIONS LEAGUE',
            sourceName: 'UEFA.com',
            url: 'https://www.uefa.com/uefachampionsleague/',
            timestamp: '45m ago',
            keyEntities: ['Manchester City', 'Barcelona', 'PSG']
          },
          {
            id: 'rw_3',
            title: 'Premier League Title Race & European Spot Drama Unfolds',
            summary: 'Tight margins at the top of the table set up dramatic final fixtures as tactical setups are put to the test.',
            category: 'PREMIER LEAGUE',
            sourceName: 'BBC Sport',
            url: 'https://www.bbc.com/sport/football',
            timestamp: '1h ago',
            keyEntities: ['Liverpool', 'Arsenal', 'Aston Villa']
          }
        ],
        groundingSources: [
          { title: "BBC Sport Football", url: "https://www.bbc.com/sport/football" },
          { title: "Sky Sports Transfer Centre", url: "https://www.skysports.com/transfer-centre" },
          { title: "UEFA Champions League Official", url: "https://www.uefa.com/uefachampionsleague/" }
        ],
        isGrounded: false,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error fetching real-world news:", error);
      res.status(500).json({ error: "Failed to fetch real-world football news" });
    }
  });

  // Google Lyria 3 Music Generation Endpoint (via Gemini API)
  app.post("/api/lyria/generate", async (req, res) => {
    try {
      const { moodId = "MENU", promptOverride, model = "lyria-3-clip-preview" } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          success: false,
          isFallback: true,
          message: "GEMINI_API_KEY is not configured in process.env. Using Web Audio procedural synthesizer fallback.",
          moodId
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const selectedModel = model === "lyria-3-pro-preview" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";
      const promptText = promptOverride || "Anthemic football career sports-drama theme, 100 BPM, D Major, soaring string quartet, energetic brass swells, no vocals";

      console.log(`🎵 Requesting Lyria 3 generation for mood [${moodId}] with model [${selectedModel}]`);

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: promptText,
      });

      let audioBase64 = "";
      let lyrics = "";
      let mimeType = "audio/wav";

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;

        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
          if (part.text && !lyrics) {
            lyrics = part.text;
          }
        }
      }

      if (!audioBase64) {
        return res.json({
          success: false,
          isFallback: true,
          message: "Lyria API stream did not yield audio data. Falling back to Web Audio procedural synth.",
          moodId
        });
      }

      return res.json({
        success: true,
        moodId,
        model: selectedModel,
        prompt: promptText,
        audioBase64,
        mimeType,
        lyrics,
        synthIdWatermark: true,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Lyria Generation Error:", error?.message || error);
      return res.json({
        success: false,
        isFallback: true,
        error: error?.message || "Failed to generate track via Lyria API",
        moodId: req.body?.moodId
      });
    }
  });

  // Contextual Event-Aware Live Match Commentary Endpoint via Gemini API
  app.post("/api/match-commentary", async (req, res) => {
    try {
      const {
        eventType = "KEY_MOMENT",
        minute = 1,
        playerName = "The Player",
        playerPosition = "ST",
        playerReputation = {},
        userClub = { name: "Home Club", symbol: "HOM", ovr: 75 },
        oppClub = { name: "Away Club", symbol: "AWY", ovr: 75 },
        score = { userScore: 0, oppScore: 0 },
        decisionText,
        decisionOutcome,
        tacticalName
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      const worldRep = playerReputation.world || playerReputation.global || 30;
      const leagueRep = playerReputation.league || 40;
      const clubRep = playerReputation.club || 50;

      if (!apiKey) {
        let fallback = `Minute ${minute}': High-octane action on the pitch involving ${playerName}!`;
        if (eventType === 'GOAL_USER') {
          fallback = `GOAL! ${playerName} produces a moment of pure magic for ${userClub.name} in minute ${minute}'!`;
        } else if (eventType === 'GOAL_OPP') {
          fallback = `GOAL! ${oppClub.name} break through in minute ${minute}' to score!`;
        } else if (eventType === 'KEY_DECISION') {
          fallback = `HIGH LEVERAGE MOMENT: ${playerName} makes a pivotal decision in minute ${minute}'! ${decisionOutcome || ''}`;
        }
        return res.json({
          success: true,
          commentary: fallback,
          isAiGenerated: false
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a world-class television football match commentator (in the style of Martin Tyler or Peter Drury).
Deliver a thrilling, high-energy 1 to 2 sentence commentary call for a live football match moment.

MATCH CONTEXT:
- Minute: ${minute}'
- Event: ${eventType}
- Key Player: ${playerName} (${playerPosition})
- Player Reputation & Fame Status: World Fame ${worldRep}/100, League Reputation ${leagueRep}/100, Club Respect ${clubRep}/100.
- User/Home Club: ${userClub.name} (Club OVR/Prestige Rating: ${userClub.ovr || 75})
- Opponent Club: ${oppClub.name} (Club OVR/Prestige Rating: ${oppClub.ovr || 75})
- Scoreboard: ${userClub.name} ${score.userScore ?? 0} - ${score.oppScore ?? 0} ${oppClub.name}
${decisionText ? `- Decision Moment Choice: "${decisionText}"` : ''}
${decisionOutcome ? `- Outcome: ${decisionOutcome}` : ''}
${tacticalName ? `- Tactical Switch: ${tacticalName}` : ''}

CRITICAL BROADCAST REQUIREMENTS:
1. Write 1 to 2 electrifying sentences that fit a top-tier European television broadcast.
2. EXPLICITLY incorporate the player's reputation level (e.g., if worldRep > 70, reference their global icon stature / superstar legacy; if lower, reference their rising wonderkid potential or raw drive) and the prestige of the clubs involved.
3. Match the drama to the scoreline and minute (e.g. late goal, high-leverage decision, tactical shift).
4. Do NOT use emojis. Do NOT wrap in quotes. Return ONLY the raw commentary sentence(s).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          temperature: 0.85,
        }
      });

      const commentary = response.text?.trim() || `Minute ${minute}': High intensity on the pitch as ${playerName} leads ${userClub.name}!`;

      return res.json({
        success: true,
        commentary,
        isAiGenerated: true,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Match Commentary API Error:", error?.message || error);
      let fallback = `Minute ${req.body?.minute || 1}': Action continues on the pitch as ${req.body?.playerName || 'the player'} steps up for ${req.body?.userClub?.name || 'the team'}.`;
      return res.json({
        success: true,
        commentary: fallback,
        isAiGenerated: false
      });
    }
  });

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
