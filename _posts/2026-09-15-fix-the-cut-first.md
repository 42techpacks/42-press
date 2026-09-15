---
title: "Fix the Cut First"
subtitle: "The 42-faizan editor improvement plan."
date: 2026-09-15
---

## Decision

Do not start with Resolve or MCP. Make the current cutter trustworthy first.

The editor has strong heuristics, but one hand-cut recording shaped its calibration. The least reliable trim decision still depends on two model votes. Milo's bad cuts trace to three places:

- `snapIn` and `snapOut` can miss the real speech edge;
- `keepIntervals` uses fixed silence rules, so it leaves or crushes pauses;
- `verifySelectedClips` is told to keep fillers and repeats inside a delivery.

Build a benchmark from several recordings. Replace global pads with audio alignment for each boundary. Make filler removal a real edit step. Then add the one-note revision loop. A Resolve adapter comes later.

## 1. Measure the failure

Save every manual correction as data:

- automatic and corrected `cutIn` / `cutOut`;
- error type: late start, junk lead, silence tail, clipped word, filler, false restart, or bad splice;
- nearby ASR words and confidence;
- silence, RMS, and VAD traces;
- selected take and transcriber.

Build a gold set from at least **5 recordings and 50-100 corrected clips**. Split tests by recording, not random clips, so one room or microphone cannot hide a weak rule.

Release only when:

- **95% or more** of heads and tails need no correction within **80ms heard-time tolerance**;
- **zero** first or last phonemes are clipped;
- **zero** extra attempt fragments remain;
- fewer than **5%** of selected clips keep a filler that Milo marked.

Track late starts, junk leads, late tails, and clipped tails separately. One average can hide opposite errors.

## 2. Refine every boundary

Keep `PAUSE_SPLIT = 0.9` as one clue for finding takes. Do not reuse that split as the final edit edge.

For each chosen take, search a small window around the first and last kept word. Score possible cut points with:

- verbatim ASR or forced-alignment word/phoneme timing;
- frame-level speech probability or adaptive VAD;
- local energy, spectral onset, and quiet zones.

Cut at the nearest safe quiet point before the first kept phoneme and after the last one. If the signals disagree, leave more air and flag the clip instead of cutting speech.

`DEFAULT_PADS`, `TIGHT_LEAD`, and `TIGHT_TAIL` become fallbacks. Learn air by boundary type: clean pause, breath, instant restart, or continuous speech. Do not use one global 0.18s / 0.32s answer.

## 3. Add boundary previews

Before stitching the full reel, render a 1-2 second preview around each edge with 250ms of context on both sides.

Show the waveform, transcript words, VAD, and proposed cut. Let Milo fix a head or tail quickly. Save that correction into the gold set.

Until the gate passes, fail closed:

- do not auto-ship fragment splices in the recommended cut;
- do not use a salvage take unless a new transcript proves one full delivery with no extra attempt;
- send uncertain lines to manual selection or rerecording.

A missing line is easy to spot. A confident bad splice is not.

## 4. Remove fillers on purpose

The current verification prompt says to keep a filler or repeat inside the chosen delivery. Change that.

Use CrisperWhisper to mark fillers, stutters, repeated words, abandoned starts, and restart phrases. Then:

1. Cut the defect at a quiet seam and use a short audio crossfade when safe.
2. If it is not safe, strongly lower that take's score and choose a cleaner one.
3. If it is the only usable delivery, show the defect for review instead of hiding it.
4. Transcribe the rendered clip again and require one complete delivery with no extra fragments or unapproved fillers.
5. Check every splice for clipped sounds, repeated words, and sudden room-tone changes.

Clean speech should be a gate before delivery style. A lively take with a false start should not beat a clean one.

## 5. Add one-note revisions

The editor already has variants, manual trims, reorder, delete, swap, and restitch. Add a small conversation layer that turns one note into one typed edit:

- “start this take earlier” -> move the head to the previous safe edge;
- “remove the um at 0:12” -> delete that token range if the splice is safe;
- “use the second take” -> replace the clip;
- “less dead air here” -> adjust the boundary or pause;
- “move this line up” -> reorder it.

Show the exact change and a short preview. Apply it to a new revision, rerender only what changed, and keep the history. Save the note, operation, and any manual fix as training data.

## 6. Let WatchReport make bounded fixes

Split WatchReport findings into two groups:

**Safe to repair:** extra silence, duplicate fragments, and broken concats.

**Needs approval:** changing a take, removing a line, reordering ideas, or adding a visual.

For safe issues, emit a typed edit, rerender, and run one more QA pass. Allow only one automatic repair cycle, and require the score to improve. The watch pass must check the repaired media, not only write a critique.

## 7. Build a timeline model

Create an internal edit decision list with source file, in/out points, order, track, transitions, captions, music, and generated assets. Keep `ffmpeg` as the predictable renderer.

Add Resolve/MCP only after the edit model and revision loop are stable, and only when a person needs a real NLE project.

## 8. Add the extras last

Captions, music, B-roll, and generated assets do not solve today's trust problem. Add them after cut accuracy and revisions pass the gate.

## Build order

1. Multi-recording gold set and labeled corrections.
2. Per-edge audio alignment and boundary previews.
3. Filler mask and clean-take gate.
4. Disable risky auto-splicing until metrics pass.
5. One-note revision loop on current variant tools.
6. WatchReport -> typed repair -> rerender -> QA.
7. Internal timeline model and Resolve/MCP adapter.
8. Music, captions, B-roll, and generated assets.

## Best first slice

Ship a boundary lab before changing the larger system:

1. Pick **20 clips Milo says are wrong**.
2. Capture the correct start, end, and defect label.
3. Plot ASR, VAD, RMS, and silence zones for each clip.
4. Build `refineClipEdges(take, words, audioFeatures)` behind a feature flag.
5. Blind-compare the old and new cuts on held-out recordings.
6. Replace `snapIn` and `snapOut` only after the held-out release gate passes.

That fixes the failure Milo can hear now and creates the data needed for every later improvement.
