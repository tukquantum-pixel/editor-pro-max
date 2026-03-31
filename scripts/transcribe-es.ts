#!/usr/bin/env npx tsx
/**
 * Transcribe Spanish audio via whisper.cpp CLI directly
 * Avoids DTW/token-level timestamp issues
 * Output: public/captions.json
 */
import path from "path";
import {writeFileSync, existsSync, readFileSync} from "fs";
import {execSync} from "child_process";

const inputPath = path.join("public", "assets", "narration-cut.wav");
const whisperPath = path.join(process.cwd(), "whisper.cpp");
const outputPath = path.join("public", "captions-cut.json");
const modelPath = path.join(whisperPath, "ggml-base.bin");

if (!existsSync(inputPath)) {
  console.error(`Audio not found: ${inputPath}`);
  process.exit(1);
}

async function main() {
  // Ensure whisper.cpp and model are installed
  if (!existsSync(path.join(whisperPath, "main"))) {
    const {installWhisperCpp} = await import("@remotion/install-whisper-cpp");
    console.log("📦 Installing Whisper.cpp...");
    await installWhisperCpp({to: whisperPath, version: "1.5.5"});
  }

  if (!existsSync(modelPath)) {
    const {downloadWhisperModel} = await import("@remotion/install-whisper-cpp");
    console.log("📥 Downloading base model...");
    await downloadWhisperModel({model: "base", folder: whisperPath});
  }

  console.log("🎙️ Transcribing (Spanish)...");

  // Run whisper.cpp CLI directly with SRT output
  const mainBin = path.join(whisperPath, "main");
  const srtOutput = path.join("public", "assets", "narration");

  execSync(
    `"${mainBin}" -m "${modelPath}" -f "${inputPath}" -l es -osrt --output-file "${srtOutput}"`,
    {stdio: "inherit"}
  );

  // Parse the SRT file into captions JSON
  const srtPath = srtOutput + ".srt";
  if (!existsSync(srtPath)) {
    console.error("SRT file not generated");
    process.exit(1);
  }

  const srtContent = readFileSync(srtPath, "utf-8");
  const captions = parseSRT(srtContent);

  writeFileSync(outputPath, JSON.stringify(captions, null, 2));
  console.log(`\n✅ Captions saved: ${outputPath}`);
  console.log(`   ${captions.length} segments`);
  if (captions.length > 0) {
    console.log(`   First: "${captions[0].text}" (${captions[0].startMs}ms)`);
    const last = captions[captions.length - 1];
    console.log(`   Last: "${last.text}" (${last.endMs}ms)`);
  }
}

function parseSRT(srt: string) {
  const blocks = srt.trim().split(/\n\n+/);
  const captions: {startMs: number; endMs: number; text: string}[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!match) continue;
    const startMs =
      +match[1] * 3600000 + +match[2] * 60000 + +match[3] * 1000 + +match[4];
    const endMs =
      +match[5] * 3600000 + +match[6] * 60000 + +match[7] * 1000 + +match[8];
    const text = lines.slice(2).join(" ").trim();
    if (text) captions.push({startMs, endMs, text});
  }
  return captions;
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
