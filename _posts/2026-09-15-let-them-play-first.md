---
title: Let Them Play First
subtitle: A solo dev flipped two screens and lifted sign-up conversion 40%. Our PostHog data says we have the same leak.
date: 2026-09-15
---

## The TikTok

The video is by Chris Raroque (@chris.raroque), a solo app developer who documents building his apps. He posted it on August 25, 2026, and it has about 73K plays. It is "mistake 5 of 10" from building four apps.

His story: in every app he built, people had to sign up before they went through onboarding. He never tested that order. He just assumed it was right. Then someone told him to flip it. He studied other consumer apps and saw that many do the opposite. They run onboarding first and only ask for the account at the end.

So he changed his flow:

- **Before:** open app -> sign up -> onboarding
- **After:** open app -> onboarding -> sign up

The result: sign-up conversion went up about 40%. He is careful about the number. It was roughly a 40% relative lift, not 40 percentage points. Still a big win for moving one screen.

## Why the flip works

Two things change when sign-up moves to the end.

1. **At the start, sign-up is a wall.** The person has not tried anything yet. You are asking for their email before they know if the app is worth it. A lot of people say no and leave.
2. **At the end, sign-up is one small step.** They already answered the questions, set things up, and saw what the app does for them. Making an account feels tiny next to what they just did. It also saves the work they already put in.

His rule now: if someone does not need an account to understand the value of your app, do not ask them to sign up before you show that value.

The first-run order he uses:

1. Show them the value
2. Let them personalize the experience
3. Ask them to sign up

One honest caveat: this is one developer's self-reported number. But the pattern behind it is common across consumer apps, and the direction is clear.

## What this means for SpeakEasy

The SpeakEasy web game is realtime voice practice with AI characters. There is a social map, encounters, HP, and streaks. Today a new visitor hits the sign-in wall before they get to any of that.

Look at the game through Chris's rule. Does a new player need an account to feel the value? No. The value is the first encounter: talking to a character, winning or losing, feeling the game react. The account only exists to save progress. HP, streaks, and the map are the reasons to come back, and those need an account. Playing one encounter does not.

So the order maps cleanly:

1. **The value:** land on the page and get into a first encounter fast.
2. **The personalization:** the player wins or loses, sees their HP and the map, and starts a streak.
3. **The ask:** "Sign in to save your run." Now the account protects something real.

The ask stops being a wall and becomes a save button.

## Our PostHog numbers

Two views from the SpeakEasy PostHog project (42-speaks-prod).

**All time:** 45 registered accounts. 27 of the 45 have zero wins. Most people who made an account never got far enough into the game to win anything.

**Last 7 days, unique people, founders excluded.** Funnel: landed -> registered -> started the tutorial -> finished it.

| Step | People | Conversion from previous step |
|------|--------|-------------------------------|
| Landed | 17 | - |
| Registered | 2 | 11.76% |
| Started the tutorial | 0 | 0% |
| Finished the tutorial | 0 | 0% |

The leak is exactly where Chris's flip predicts it. 15 of the 17 landers (88%) never made an account. They hit the sign-up wall first and left. The two who did register took a median of 35 seconds to sign up, and neither of them started the tutorial.

Small sample, one week, so treat it as directional. But the direction is loud: the wall comes first, and almost nobody climbs it.

If the game comes first, that 88% loss is the number the flip has to shrink. The ask happens after the player has something to lose.

## What to change

1. **Let visitors play without an account.** Drop them into a first encounter as a guest. Keep the run in local state.
2. **Move the ask to the end of the first run.** After the win or loss, show what they earned (HP, streak, map progress) and ask them to sign in to keep it.
3. **Carry the guest run over.** When they sign in, merge the guest progress into the account. Losing your first run at sign-up would undo the whole point.

## How we will know it worked

After the flip, the funnel becomes: landed -> started the tutorial -> finished it -> signed up. Measure it against the numbers above. Chris's benchmark is a roughly 40% relative lift in sign-up conversion. Our sample is small (17 landers in a week, 45 accounts all time), so treat early numbers as directional, not final. The direction to watch is simple: more sign-ups per visitor, and fewer accounts with zero wins.

## Sources

- Chris Raroque, "Mistake no. 5/10: the order of your onboarding matters," TikTok, August 25, 2026: https://www.tiktok.com/@chris.raroque/video/7678012219606486303
- SpeakEasy PostHog (42-speaks-prod), funnel "Landed -> registered -> started the Splish tutorial -> finished it": https://us.posthog.com/project/212704/insights/vQ1uFLV8
