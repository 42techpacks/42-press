---
title: An AI Editing Agent for Faizan's Content Engine
subtitle: The DaVinci Resolve + AI agent workflow from that TikTok, mapped to npcfaizan's advice reels and SpeakEasy.
date: 2026-09-15
---

## Decision

Build Faizan an AI editing agent: DaVinci Resolve plus an AI agent wired in through Resolve's MCP server. The agent cuts the first draft of every reel. Faizan gives notes one at a time until it is right. This attacks his exact bottleneck. He posts near-daily talking-head reels on top of Stanford, SpeakEasy, and FORTYTWO. Editing is the slowest part of that loop.

## What the TikTok shows

The video is by @reyhanmerekar (about 12.5K plays). It breaks down a guide from Matthew Berman's video editor, who goes by "future Brian" on X and has about 20 years of editing experience.

His setup, per the video:

1. **The connection.** DaVinci Resolve plus its MCP server. This lets the AI agent (called "GPT-6 Astra" in the video) see and drive a real Resolve project.
2. **The brief.** One conversation: what you are making, who is watching, what matters, what to leave out.
3. **First cut.** The agent builds the draft on its own.
4. **Notes.** The editor rewrites it, one note at a time.
5. **Music and assets.** He asks for music in plain words and the agent fetches it. Animated assets come from image models.
6. **Self-check.** The agent does its own QA pass, then exports.

The honest caveat in the video: it still makes mistakes. The editor's judgment is the value. The agent removes labor, not taste.

## Faizan's content today

From his public Instagram (@npcfaizan):

- 108K followers, verified, 232 posts. Bio: "dress cool & speak easy | nyc & sf, stanford, coding: @speakeasy.run, clothing: @fortytwoco".
- **Cadence: near-daily.** Ten reels in the two weeks from Aug 26 to Sep 9.
- **Three pillars.** Advice and self-improvement talking-head reels (communication, confidence, relationships) are his core. Fashion and NYC style is second. AI and building-in-public (Grok at the office, AI concept art, writing good emails) is third.
- **What performs.** His biggest hits are advice reels: 179K likes in January 2026 (a video tailored to Kai Cenat) and 89K likes ("fulfilling potential requires boldness"). His recent reels run 141 to 2.2K likes. The gap between his ceiling and his floor is not ideas. It is getting a proven format out more often.

## Why this tool fits him

1. **Volume is his game.** Near-daily posting next to a startup and school. An agent first cut turns hours of editing into minutes of review per reel.
2. **His format is agent-friendly.** Talking-head advice reels are cuts, captions, punch-ins, music, and b-roll. That sits well inside what this workflow does.
3. **The brief maps to his brand.** "What are you making, who is watching, what do you leave out" is exactly how a 179K-like reel becomes a reusable template. Write the brief once per format, then reuse it.
4. **The review loop suits a founder.** One note at a time works from a phone between meetings.
5. **It feeds SpeakEasy too.** The same agent can cut product clips, founder updates, and game content for @speakeasy.run. One setup, two accounts.

## Proposed workflow

1. Record the take on his phone. One or two takes.
2. Drop the footage in a folder. The agent gets the brief: audience, hook, length target, what to cut.
3. The agent builds the first cut in Resolve: picks takes, cuts filler, adds captions, punch-ins, and music.
4. Faizan watches and replies with one note at a time.
5. The agent runs its own QA pass: audio levels, caption typos, pacing. Then it exports vertical.
6. Faizan gives the final look and posts.

## Limits

- The agent still makes mistakes. The TikTok says so itself. Faizan's taste stays the moat.
- Music rights matter at 108K followers with brand partners. Agent-fetched music needs a rights-safe source.
- Numbers here come from his public profile. The logged-out view showed his 12 most recent reels out of 232 posts, plus his two pinned hits.
