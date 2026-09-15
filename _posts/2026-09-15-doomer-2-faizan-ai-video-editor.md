---
title: "Doomer 2.0: Faizan's AI Video Editor"
date: 2026-09-15
---

Milo already built both halves of this idea. They live in two repos.

**Doomer is the brain.** The public [Doomer repo](https://github.com/npcmilo/doomer) studies published TikToks and Instagram posts. It transcribes videos, reads comments, studies frames, compares platforms, and simulates where viewers may scroll away.

**42-faizan is the editing hands.** The private workbench now turns one continuous recording into scored takes and four finished edit options. It shipped in PR #4: “Watch pass, hand-edit calibration, CrisperWhisper, and API credit meter.”

This is not a future DaVinci Resolve agent. It is a working `ffmpeg` pipeline with AI review.

## What the editor does now

The input is one continuous recording with several takes.

1. **Transcribe:** CrisperWhisper produces word-level timing. `whisper-cli` is the fallback.
2. **Find takes:** silences of at least **0.9 seconds** split the recording into takes.
3. **Group lines:** the workbench groups those takes into script lines.
4. **Score delivery:** every take gets a 0-10 score using Faizan's delivery rubric.
5. **Cut:** `ffmpeg` makes frame-accurate clips with a full re-encode.
6. **Keep natural air:** calibrated timing uses `TIGHT_LEAD = 0.18s` and `TIGHT_TAIL = 0.32s`.
7. **Stitch variants:** the system renders four choices.

The four versions are:

- **Last take** - the final recording of each line
- **Best delivery** - the highest-scored take for each line
- **Most cohesive** - choices that work best as one performance
- **Tight (post-ready)** - the cleanest, fastest version

Faizan chooses a variant. There is no note-by-note timeline patch loop yet.

## The watch pass

After rendering, the workbench checks its own edit.

It gathers:

- scene-change keyframes at jump cuts;
- a cut map;
- evidence from Doomer's SQLite content corpus.

It sends that context through one Claude vision call. The result is a `WatchReport` with:

- a clear critique;
- timestamped edit suggestions;
- a performance score.

The same pass can catch broken concatenations, so it checks both taste and render quality.

## How the two repos fit

| Part | Job |
|---|---|
| **Doomer Core** | Stores the content corpus, transcripts, comments, frame analysis, personas, and simulated retention evidence in SQLite. |
| **42-faizan workbench** | Transcribes the new recording, splits and scores takes, cuts clips, renders four variants, and runs the watch pass. |

Doomer already has `yt-dlp`, `ffmpeg`, Groq Whisper, Claude analysis, Playwright scraping, Instagram matching, resumable jobs, and Markdown/JSON reports.

Its simulated viewers are useful for spotting weak hooks and slow sections, but they are not real retention. Keep that label clear and compare them with real platform data over time.

## What changed from the first plan

The original proposal assumed DaVinci Resolve, an MCP server, and reversible edits from one note at a time. The shipped system is simpler:

- no Resolve;
- no MCP bridge;
- no remote timeline state;
- no note-and-revision patch loop;
- no music or generated-asset step.

Direct `ffmpeg` cuts remove a desktop app, license, VM, and another failure point. The system makes complete variants instead of trying to behave like a human editor inside Resolve.

That is the right first build for Faizan's talking-head reels.

## API credit meter

The workbench asks for the current Anthropic Console balance, then counts down estimated usage from that number. The balance is saved between runs, and the app warns when it gets low.

This is a budget guide, not a live billing connection. The user-entered balance must be refreshed when the Console changes.

## What to build next

### 1. Real comparison data

Save which variant Faizan picks, which takes he replaces by hand, and why. Compare those choices with the delivery scores and watch report.

That turns taste into calibration data instead of adding more prompts.

### 2. A small hand-edit layer

Add only the edits the current workflow proves it needs:

- swap one selected take;
- trim one clip;
- restore or remove a pause;
- reorder a line;
- rerender the affected variant.

Keep each change reversible. A full Resolve integration is not needed for these moves.

### 3. Captions and audio checks

Add caption timing, safe-zone checks, speech levels, and music-rights tracking only after the cut choices are reliable.

### 4. Measure the real outcome

Track:

- time to first variants;
- variant chosen;
- number of manual changes;
- broken-render rate;
- watch-pass score;
- weekly videos published;
- real retention when platform data is available.

The first goal is a useful first cut in under ten minutes, with Faizan choosing among good options instead of rebuilding the timeline.

## Main risks

**Take scoring can sound more certain than it is.** Compare scores with Faizan's choices and recalibrate the rubric.

**The watch pass can miss rhythm.** Keep its suggestions timestamped and show the evidence. Faizan remains the final editor.

**Silence splitting can group lines wrong.** Show the cut map and make regrouping easy.

**Scraping can fail.** TikTok may show captchas, and Instagram can rate-limit a logged-in account. Uploaded footage must remain the core editing path.

**Concatenation can break.** Keep the scene-change keyframes and watch pass as a required check before delivery.

## Recommendation

Do not rebuild this around DaVinci Resolve.

Keep **Doomer Core** as the analysis memory and **42-faizan** as the direct editing workbench. Improve the hand-edit controls and learn from Faizan's variant choices. Add timeline software only if a proven editing need cannot be handled safely with `ffmpeg`.

The product now answers two useful questions:

- Doomer: **Why did the old post work?**
- 42-faizan: **Which cut of the new take works best, and what should we fix before posting?**

That is already Doomer 2.0.

## Sources

- [Doomer repository](https://github.com/npcmilo/doomer)
- [Doomer README](https://github.com/npcmilo/doomer/blob/main/README.md)
- [Doomer package manifest](https://github.com/npcmilo/doomer/blob/main/package.json)
- Private `42techpacks/42-faizan` main branch, PR #4: “Watch pass, hand-edit calibration, CrisperWhisper, and API credit meter”
- [AI editing-agent TikTok walkthrough](https://www.tiktok.com/@reyhanmerekar/video/7684020803641412877)
- [Faizan on Instagram](https://www.instagram.com/npcfaizan/)
