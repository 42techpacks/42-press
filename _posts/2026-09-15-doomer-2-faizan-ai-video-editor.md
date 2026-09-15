---
title: "Doomer 2.0: From Content Analyst to Faizan's AI Video Editor"
date: 2026-09-15
---

Milo already built the hard research half of this idea.

The existing [Doomer repo](https://github.com/npcmilo/doomer) studies a creator's TikToks and Instagram posts. It downloads videos, transcribes them, reads comments, studies frames, compares platforms, and simulates where different viewers may scroll away.

What it does not do is edit.

The next version should keep Doomer as the brain that knows what works. Then it should add a DaVinci Resolve agent that can turn that knowledge into a first cut, take one note at a time, check its own work, and export the final reel.

## What already exists

Doomer is more than a rough idea. It is a 7,000-line TypeScript CLI with a real data pipeline.

It already has:

- TikTok profile and video scraping with `yt-dlp`
- Video and audio processing with `ffmpeg`
- Speech transcription with Groq Whisper
- Frame analysis, comment scoring, and reports with Claude
- TikTok comment scraping with Playwright
- Authenticated Instagram scraping
- TikTok-to-Instagram post matching
- SQLite storage and resumable jobs
- Markdown and JSON reports
- Creator-specific viewer personas
- Beat-by-beat watch simulations
- Simulated retention curves

That last part matters most. Doomer can show a video to a fake viewer one beat at a time. The viewer must decide to keep watching or scroll before seeing the next beat. This gives the system a useful, if simulated, view of weak hooks and slow sections.

Doomer also says clearly that this retention is simulated, not measured. Keep that honesty.

## Where the repo stopped

The repo had five commits from July 24 to July 26, 2026. The last update added safer handling for partial Instagram comment scrapes.

The analysis side is deep. The product side is still a local tool.

It has no:

- DaVinci Resolve connection
- MCP server
- timeline or edit-decision model
- first-cut generator
- note and revision loop
- preview player
- render queue
- hosted app
- team workspace
- automated tests or CI

The scraping path is also fragile. TikTok may show captchas. Instagram needs a logged-in browser account and can rate-limit that account. The README recommends a throwaway Instagram account and slow requests.

The code is tied to specific Anthropic and Groq calls. Model names, structured-output code, and prompt caching should be checked before the next run. Runtime health is not proven by the repo alone.

## The new product

Doomer 2.0 should be a creator editing system with two loops.

### Loop 1: Learn from published content

This is the current Doomer.

It studies Faizan's old videos and builds a creator playbook:

- hooks that hold attention
- topics that earn comments
- ideal reel length
- speaking pace
- cut frequency
- caption style
- punch-in rhythm
- music level
- common drop-off points
- differences between TikTok and Instagram

This should produce a versioned `creator-profile.json`. It becomes Faizan's editing memory.

### Loop 2: Make the next video

This is the new Resolve agent.

The flow should match the [TikTok walkthrough](https://www.tiktok.com/@reyhanmerekar/video/7684020803641412877):

1. Faizan gives the agent raw clips and a short brief.
2. The agent transcribes and labels the footage.
3. It uses the Doomer creator profile to plan a cut.
4. It controls DaVinci Resolve through an MCP server.
5. It builds a first cut.
6. Faizan gives one note at a time.
7. The agent makes each change as a reversible patch.
8. It can find music and make simple visual assets.
9. It checks the whole edit against the brief.
10. It exports platform-ready files.

## What to keep

### Keep the media pipeline

The `yt-dlp`, `ffmpeg`, and transcription work already handles the raw material Doomer needs. Keep the file layout, timed transcript segments, frame extraction, and resumable stages.

### Keep SQLite and idempotent jobs

Editing runs will fail halfway through. A creator should be able to restart without paying to repeat every analysis step.

### Keep `analysis.json`

This is the bridge between the old and new products. Turn it into a stable contract that an editor worker can read.

Add:

- creator style rules
- hook patterns
- target duration
- scene labels
- keep and cut ranges
- b-roll needs
- caption rules
- music mood
- risk flags
- export targets

### Keep the persona panel

Use the viewer simulations before and after an edit. Compare the raw cut with the edited cut. Show whether the new opening holds more simulated viewers.

Never present this as real audience retention.

### Keep cross-platform learning

Faizan often posts the same idea on several platforms. Keep Doomer's matching system so the agent can learn which version worked better on each one.

## What to rebuild

### Rebuild model access behind one adapter

The code now talks directly to vendor SDKs in key parts of the pipeline. Add one model interface for:

- transcription
- visual understanding
- planning
- structured edit decisions
- viewer simulation
- report writing

This lets the team use a GPT-6 Astra-class model for long, multimodal planning while keeping cheaper models for simple jobs.

Do not send every task to the largest model.

### Rebuild reports as structured facts first

Markdown is useful for people. It is a bad source of truth for an editor.

Every model step should return a strict schema with source timecodes and confidence. Markdown should be rendered from that data.

### Rebuild the browser scrapers as optional inputs

Scraping should not block editing. If TikTok or Instagram fails, Faizan should still be able to upload footage and make a cut.

Published-content analysis can run later and improve the creator profile.

### Rebuild the CLI around jobs

Keep the CLI for engineers. Put the main workflow in a small web app:

- New edit
- Upload footage
- Write brief
- Watch first cut
- Send one note
- Compare versions
- Approve export

The Resolve machine can run as a local worker paired to the web app.

## What current frontier models add

A GPT-6 Astra-class model should not merely write better summaries. Its value is keeping more of the editing problem in one working context.

### One model can see the whole job

The agent can reason across:

- the raw video
- the full transcript
- old high-performing reels
- comment themes
- the current Resolve timeline
- Faizan's brief
- every note in the review history

Older pipelines split these into isolated prompts. That made the final edit less consistent.

### Better tool use

The model can plan several editing actions, call Resolve tools, inspect the result, and correct mistakes. It should work from the real timeline state, not assume a command succeeded.

### Better note handling

A note like "make the first ten seconds feel less preachy" is not one edit command. The agent can translate it into smaller choices:

- start with a more personal line
- remove a pause
- shorten the claim
- delay the lesson
- soften the caption

It should propose or apply those changes while preserving the rest of the cut.

### Better visual judgment

The model can compare raw footage, timeline thumbnails, captions, motion, and the rendered preview. This helps it catch jumpy cuts, covered faces, bad caption breaks, and weak opening frames.

### Better self-review

Before export, the agent can replay the result against a checklist and the original brief. It can also run the Doomer persona panel on the new cut.

The model will still make mistakes. The TikTok creator says judgment remains the moat. Faizan stays the final editor.

## The Resolve architecture

Keep editing separate from analysis.

### 1. Doomer Core

Owns creator research, transcripts, comments, performance data, personas, and the creator profile.

### 2. Edit Planner

Turns a brief and raw footage into an edit plan.

Example output:

```json
{
  "targetDurationSec": 38,
  "hook": { "source": "A003", "start": 12.4, "end": 16.8 },
  "cuts": [
    { "source": "A003", "start": 12.4, "end": 22.1 },
    { "source": "A001", "start": 44.0, "end": 58.3 }
  ],
  "captionStyle": "faizan-clean",
  "musicMood": "warm, low-energy hip-hop",
  "qaRules": ["No pause over 400ms in hook", "Keep face clear of captions"]
}
```

### 3. Resolve MCP worker

Owns all timeline changes.

Minimum tools:

- create project
- import media
- create timeline
- add clip range
- trim clip
- move clip
- remove clip
- add transition
- add punch-in
- add caption
- add music
- set audio level
- render preview
- export final
- read current timeline state
- undo a named patch

Every mutation should return the new timeline state and a preview reference.

### 4. Review ledger

Store each note with:

- who gave it
- what version it applies to
- the agent's interpretation
- the exact timeline changes
- before and after previews
- accepted or reverted status

This makes "one note at a time" safe.

### 5. QA runner

Check:

- the opening frame is clear
- the hook starts fast
- there are no dead pauses
- captions match speech
- captions stay inside safe zones
- music does not cover speech
- cuts do not land mid-word
- assets have rights and source records
- export settings match the platform
- the final cut still matches the brief

## Faizan's first workflow

Start with his common advice reel. It is the safest format because it is repeatable: one speaker, a clear point, captions, jump cuts, and light visual changes.

Input:

- one or more talking-head clips
- optional screen recordings or photos
- a brief such as "38-second Instagram reel about asking better questions"

First cut:

- pick the strongest opening line
- remove false starts and long pauses
- order the clearest argument
- add captions in Faizan's style
- add restrained punch-ins
- mark places that need b-roll
- suggest music, but do not publish unlicensed audio
- render a low-resolution preview

Review:

Faizan sends one note. The agent changes only what that note requires. It shows what changed and keeps a clean undo path.

Export:

The agent runs QA, creates the final vertical file, and saves a version made for each platform.

## MVP plan

### Phase 1: Prove the edit loop

- One local Resolve install
- Manual footage upload
- Brief to first cut
- Transcript-based cuts
- Captions
- One-note-at-a-time patches
- Preview and undo
- Manual final approval

Do not add music search, image generation, or a full team app yet.

### Phase 2: Add Doomer intelligence

- Build Faizan's creator profile from existing reports
- Rank hook choices using past results
- Run simulated viewers on raw and edited cuts
- Add style presets from strong old reels
- Show the reason behind each major cut

### Phase 3: Add assets and scale

- Rights-safe music search
- Generated diagrams and motion assets
- B-roll retrieval
- Team review links
- More creators
- Cloud job queue
- Cost and latency controls

## Success measures

The MVP wins if it reduces work without lowering Faizan's bar.

Track:

- time from upload to first cut
- time from first cut to approval
- number of notes per video
- percent of agent edits reverted
- caption error rate
- export failure rate
- weekly videos published
- real retention once platform data is available

The first goal should be a useful first cut in under ten minutes, with most changes made through notes instead of manual timeline work.

## Main risks

### Resolve control may be brittle

The MCP server can expose tools, but it does not guarantee good edits. Build timeline readback, previews, undo, and retries before adding more actions.

### Simulated viewers can sound more certain than they are

Keep the labels. Compare simulation with real results over time. Calibrate or drop personas that do not predict anything useful.

### Scraping can fail

Use official creator exports or platform APIs when available. Keep uploaded media as the core path.

### Generated assets create rights risk

Track the source and license for music, images, and footage. Require approval before export when rights are unclear.

### A strong model can still damage a good cut

Keep notes scoped. Save versions. Show previews. Let Faizan undo anything.

## Recommendation

Do not start over.

Fork the current repo into two clear parts:

- **Doomer Core** learns what works.
- **Doomer Edit** turns that learning into a Resolve timeline.

The fastest proof is one Faizan advice reel from raw footage to approved export. Use the current transcript, frame, persona, and report systems to guide the cut. Add the Resolve MCP worker and review ledger around them.

The old repo already answers, "Why did this post work?"

The new product should answer, "Can you make the next cut better, show me why, and fix only the thing I just asked for?"

## Sources

- [Doomer repository](https://github.com/npcmilo/doomer)
- [Doomer README](https://github.com/npcmilo/doomer/blob/main/README.md)
- [Doomer package manifest](https://github.com/npcmilo/doomer/blob/main/package.json)
- [AI editing-agent TikTok walkthrough](https://www.tiktok.com/@reyhanmerekar/video/7684020803641412877)
- [Faizan on Instagram](https://www.instagram.com/npcfaizan/)
