#!/usr/bin/env node
/**
 * Cut silent segments from both video and audio simultaneously.
 * Uses ffmpeg-static (no system ffmpeg needed).
 * Output: public/assets/demo-trimmed.mp4 + narration-trimmed.mp3
 */
const {execSync} = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const path = require("path");
const fs = require("fs");

const videoIn = "public/assets/demo.mp4";
const audioIn = "public/assets/narration.ogg";
const videoOut = "out/demo-final.mp4";
const tmpDir = "/tmp/tukdemo-segments";

// Silence segments detected by ffmpeg silencedetect (noise=-30dB, d=1.5s)
// Adding 0.3s padding to keep transitions smooth
const silences = [
  {start: 7.45, end: 20.82},    // 13.4s silence
  {start: 26.16, end: 27.95},   // 1.8s
  {start: 35.22, end: 37.63},   // 2.4s
  {start: 38.99, end: 40.04},   // 1.0s
  {start: 41.14, end: 47.83},   // 6.7s
  {start: 49.88, end: 52.65},   // 2.8s
  {start: 56.50, end: 59.31},   // 2.8s
  {start: 60.50, end: 61.99},   // 1.5s
  {start: 68.25, end: 69.18},   // 0.9s
  {start: 77.66, end: 78.62},   // 1.0s
];

// Calculate speaking segments (inverse of silences)
const totalDuration = 86.8;
const segments = [];
let cursor = 0;

for (const s of silences) {
  if (s.start > cursor) {
    segments.push({start: cursor, end: s.start});
  }
  cursor = s.end;
}
if (cursor < totalDuration) {
  segments.push({start: cursor, end: totalDuration});
}

console.log(`📐 ${segments.length} speaking segments:`);
let totalSpeaking = 0;
segments.forEach((s, i) => {
  const dur = (s.end - s.start).toFixed(1);
  totalSpeaking += s.end - s.start;
  console.log(`   ${i + 1}. ${s.start.toFixed(1)}s → ${s.end.toFixed(1)}s (${dur}s)`);
});
console.log(`⏱️  Total: ${totalSpeaking.toFixed(1)}s (was ${totalDuration}s, cut ${(totalDuration - totalSpeaking).toFixed(1)}s)\n`);

// Create temp directory
if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, {recursive: true});
}
fs.mkdirSync(tmpDir, {recursive: true});

// Cut each segment from the merged video+audio
console.log("✂️  Cutting segments...");

// First merge video+audio into one file for synchronized cutting
const mergedTmp = path.join(tmpDir, "merged.mp4");
execSync(
  `"${ffmpegPath}" -i "${videoIn}" -i "${audioIn}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${mergedTmp}" -y`,
  {stdio: "pipe"}
);

const segmentFiles = [];
for (let i = 0; i < segments.length; i++) {
  const {start, end} = segments[i];
  const outFile = path.join(tmpDir, `seg_${String(i).padStart(3, "0")}.mp4`);
  segmentFiles.push(outFile);

  execSync(
    `"${ffmpegPath}" -i "${mergedTmp}" -ss ${start} -to ${end} -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 128k "${outFile}" -y`,
    {stdio: "pipe"}
  );
  process.stdout.write(`   ✅ Segment ${i + 1}/${segments.length}\r`);
}
console.log("\n");

// Create concat file
const concatFile = path.join(tmpDir, "concat.txt");
const concatContent = segmentFiles.map((f) => `file '${f}'`).join("\n");
fs.writeFileSync(concatFile, concatContent);

// Concatenate all segments
console.log("🔗 Merging segments...");
execSync(
  `"${ffmpegPath}" -f concat -safe 0 -i "${concatFile}" -c copy "${videoOut}" -y`,
  {stdio: "pipe"}
);

// Get final duration
const info = execSync(
  `"${ffmpegPath}" -i "${videoOut}" -f null /dev/null 2>&1 || true`
).toString();
const durMatch = info.match(/Duration: (\d{2}:\d{2}:\d{2}\.\d+)/);

console.log(`\n🎬 Done! Output: ${videoOut}`);
console.log(`   Duration: ${durMatch ? durMatch[1] : "unknown"}`);
console.log(`   Size: ${(fs.statSync(videoOut).size / 1024 / 1024).toFixed(1)} MB`);

// Cleanup
fs.rmSync(tmpDir, {recursive: true});
console.log("🧹 Cleaned up temp files");
