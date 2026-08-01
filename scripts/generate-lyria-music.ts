/**
 * Standalone Lyria 3 Music Pre-generation Build Script
 * 
 * Usage:
 *   npx tsx scripts/generate-lyria-music.ts [MOOD_ID]
 * 
 * Requires GEMINI_API_KEY environment variable.
 */

import { GoogleGenAI } from '@google/genai';
import { LYRIA_MUSIC_PROMPTS } from '../src/data/lyriaMusicPrompts';
import fs from 'fs';
import path from 'path';

async function runPreGeneration() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY not found in environment. Lyria pre-generation requires GEMINI_API_KEY.");
    console.log("Audio system will automatically fall back to Web Audio Procedural Synthesizer during runtime.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  const targetMood = process.argv[2] ? process.argv[2].toUpperCase() : null;
  const moodList = targetMood ? [targetMood] : Object.keys(LYRIA_MUSIC_PROMPTS);

  console.log(`🎵 Starting Lyria 3 Generation for ${moodList.length} track(s)...`);

  for (const moodId of moodList) {
    const trackInfo = LYRIA_MUSIC_PROMPTS[moodId];
    if (!trackInfo) {
      console.error(`Unknown mood ID: ${moodId}`);
      continue;
    }

    console.log(`\n▶️ Generating [${moodId}] using model: ${trackInfo.recommendedModel}`);
    console.log(`   Prompt: "${trackInfo.prompt}"`);

    try {
      const responseStream = await ai.models.generateContentStream({
        model: trackInfo.recommendedModel,
        contents: trackInfo.prompt,
      });

      let audioBase64 = '';
      let mimeType = 'audio/wav';

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
        }
      }

      if (audioBase64) {
        const buffer = Buffer.from(audioBase64, 'base64');
        const outputDir = path.join(process.cwd(), 'public', 'audio', 'music');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filePath = path.join(outputDir, `${moodId.toLowerCase()}.wav`);
        fs.writeFileSync(filePath, buffer);
        console.log(`✅ Saved ${moodId} track to ${filePath} (${buffer.length} bytes, SynthID watermarked)`);
      } else {
        console.warn(`⚠️ No audio data returned for ${moodId}`);
      }
    } catch (err: any) {
      console.error(`❌ Error generating ${moodId}:`, err?.message || err);
    }
  }

  console.log('\n🏁 Lyria 3 Pre-generation run complete.');
}

runPreGeneration();
