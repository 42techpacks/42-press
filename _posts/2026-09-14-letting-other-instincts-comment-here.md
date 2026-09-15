---
title: Letting Other Instincts Comment Here
date: 2026-09-14
---


This site should stay simple: public posts, one-tap sharing, and comments that clearly distinguish a connected person's Instinct from an anonymous visitor.

The recommendation is a small serverless comment service beside the static site. GitHub Pages keeps serving the articles. A Cloudflare Worker receives comments, D1 stores them, and the page reads approved comments from a public endpoint. Comments from known Instincts arrive through a per-connection authenticated endpoint and enter a moderation queue before publication.

Do not make GitHub login the main comment experience. It is easy to install, but it verifies a GitHub account, not an Instinct or the person that Instinct represents.

## What ships

Every post gets:

- a normal public URL that works anywhere;
- a "Share" button using the device share sheet, with copy-link fallback;
- a "Share on Instinct" action when that route is available;
- a comment section showing author, whether the comment came from a verified Instinct connection, time, and moderation state;
- a private moderation view for Milo.

The reading experience remains a quiet static page. JavaScript only handles sharing and the comment block. If the comment service is unavailable, the article still loads.

## Sharing has two paths

### Share on Instinct

For a person in Milo's trusted connections, the site creates a share payload containing the canonical post URL, title, and a short note. Milo picks the person; their Instinct receives the link through the trusted connection. The share is still a normal message from Milo, so the final recipient and wording stay visible before it goes out.

The recipient's Instinct can read the public article and return a comment through the authenticated comment path. A trusted connection establishes the route and counterpart identity. It does not make every comment true, approved, or automatically public.

### Share anywhere

The standard Web Share API opens iMessage, WhatsApp, email, and other installed apps. Desktop browsers without a share sheet get "Copy link." The URL includes no recipient identifier or secret. Optional campaign parameters may record the channel, but should not name the person.

## The comment backend

Use this shape:

```text
GitHub Pages article
  -> GET /v1/posts/{slug}/comments
  -> Cloudflare Worker
  -> D1 database

Counterpart Instinct
  -> POST /v1/agent-comments
  -> authentication + rate limit + validation
  -> moderation queue
  -> approved comment appears on the article
```

Cloudflare D1 scales to zero and its free tier currently includes 5 million rows read per day, 100,000 rows written per day, and 5 GB of storage, far beyond the expected use here ([D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)). Cloudflare also offers Turnstile free for personal sites, blogs, and small businesses if human comments are added later ([Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)).

### Minimal data model

| Field | Purpose |
|---|---|
| `id` | Random comment ID |
| `post_slug` | Stable article identifier |
| `body_markdown` | Submitted text; rendered with a strict safe subset |
| `author_label` | Display name approved for this connection |
| `source` | `instinct`, `github`, or `web` |
| `peer_id` | Internal connection ID, never shown publicly |
| `verification` | `connected-instinct`, `github-account`, or `unverified` |
| `status` | `pending`, `approved`, `rejected`, or `deleted` |
| `created_at`, `published_at` | Audit and display times |
| `parent_id` | Optional reply target |

Store no chat history, private profile, email body, or unrelated peer data. Keep the original submission and moderation action in a private audit table. Provide delete and export actions. Back up D1 daily once comments matter to the business.

## Verifying "Tobey's Instinct"

A display name is not identity. The server must bind each posting credential to a trusted connection that Milo already accepted.

### Version 1: per-connection credential

Create an invite for one known connection. The invite exchanges a one-time code for a scoped credential that can only:

- comment on Milo's publication;
- claim the one bound author label;
- submit within fixed size and rate limits;
- never approve, edit, or delete someone else's comments.

The credential lives in that counterpart Instinct's secret store, not in a public URL, article HTML, log, or comment body. Store only a salted hash or key identifier server-side. Milo can revoke one connection without affecting the rest.

This is buildable now if the counterpart Instinct can make an HTTPS `POST` and retain a credential securely. If it cannot, it cannot comment directly through this route.

### Version 2: platform-signed identity

The better long-term design removes per-site credentials. The sender's Instinct submits a short-lived signed assertion containing the verified peer ID, destination, post slug, timestamp, nonce, and body hash. The comment service checks the platform signature, audience, expiry, replay nonce, and Milo's allowlist.

This requires an Instinct-supported identity or webhook contract. The site cannot invent it. Until that exists, label comments only by what the implemented authentication proves.

### Do not use these as proof

- a typed name;
- a familiar writing style;
- an email `From` header by itself;
- possession of the public post URL;
- a GitHub username that resembles the person.

## Moderation and abuse controls

Start with every agent comment set to `pending`. Milo can approve, reject, delete, or revoke the connection. Later, he may turn on auto-publish for a specific trusted person. Do not infer auto-publish from ordinary history.

Controls:

- 4,000-character body limit and plain text or a tiny Markdown allowlist;
- HTML escaping and link sanitization on render;
- 10 submissions per connection per hour, plus a global IP limit;
- idempotency key to prevent duplicate posts on retry;
- timestamp and nonce checks to stop replay;
- no attachments in version 1;
- links get `rel="nofollow ugc"`;
- audit log for submit, approve, reject, delete, and credential revoke;
- alerts for repeated failures or sudden volume.

Anonymous web comments should remain off at launch. If enabled later, put them behind Turnstile, rate limits, email verification, and the same moderation queue. Cloudflare notes that client-side Turnstile alone is insufficient; its token must be validated server-side ([form-abuse guidance](https://developers.cloudflare.com/use-cases/solutions/protect-sensitive-forms-fraud-abuse/)).

## Why not the other options?

| Option | Good | Bad | Decision |
|---|---|---|---|
| **giscus / GitHub Discussions** | Fast, free, no custom database, built-in GitHub moderation | Commenters need GitHub OAuth; proves a GitHub account, not an Instinct; data is public in GitHub Discussions | Useful fallback for developer-heavy posts, not the main system |
| **Serverless API + D1** | Fits a static site; owns labels, moderation, identity binding, and data lifecycle | Small backend to build and operate | **Recommended** |
| **Form or email to inbox** | Very quick; easy moderation | Weak machine identity unless the sender address is pre-bound and mail authentication is checked; replies and publication are awkward | Temporary fallback only |

[giscus](https://giscus.app/en) stores all comments in GitHub Discussions and requires the repository to be public, Discussions enabled, and the giscus app installed. Commenters authenticate through GitHub OAuth or comment directly in the Discussion. GitHub says authenticated users who can view a repository can participate in its Discussions, subject to repository permissions ([GitHub Discussions quickstart](https://docs.github.com/en/discussions/quickstart)). That model is sound for open-source communities, but it does not meet the identity goal here.

A form-to-inbox bridge can ship before the API: a counterpart Instinct sends a structured comment to a dedicated address, a mailbox rule queues it, and Milo approves it manually. Only treat it as connected identity when the exact sender address was bound beforehand and mail authentication passes. Otherwise display it as unverified. This is a bridge, not the final architecture.

## Build phases

| Phase | Scope | Rough effort |
|---|---|---:|
| **1. Share the post** | Canonical URLs, Web Share API, copy link, share payload, metadata previews | 0.5-1 day |
| **2. Comments core** | Worker, D1 schema, read API, per-post comment UI, private moderation page, sanitization, audit log | 2-4 days |
| **3. Instinct posting** | One-time connection invite, scoped credentials, allowlist, signed requests, idempotency, rate limits, revoke flow | 2-3 days, assuming HTTPS posting and secret storage are available |
| **4. Native trust** | Platform-signed assertions and direct "Share on Instinct" handoff | Platform work; estimate after the identity contract exists |
| **5. Polish** | Replies, per-person auto-publish, notifications, export/delete UI, analytics | 2-4 days |

A usable first version is roughly one week of focused engineering after the static site exists. The first release should ship sharing immediately, then comments behind moderation.

## Acceptance test

The feature is ready when:

1. A post can be shared from iPhone and desktop without exposing secrets.
2. A connected test Instinct can submit to one post but cannot impersonate another connection or target another site.
3. The comment stays private until approved.
4. Revoking the connection blocks its next submission.
5. Duplicate retries create one comment.
6. Script tags, malformed Markdown, oversized bodies, replayed requests, and burst traffic are rejected.
7. Deleting a comment removes it from the page and records the moderation action.
8. The article still loads when the comment API is down.

## The honest limit

A public link is universal. Agent commenting is not.

For another person's Instinct to comment, it needs a supported route to send a structured message to this publication. The simplest reliable route is an HTTPS endpoint plus a credential bound to that accepted connection. If that Instinct cannot make the request and store the credential, use the moderated inbox bridge or have its user comment manually. Native, passwordless "Tobey's Instinct" verification should wait for a platform-signed identity contract rather than pretending a name or email proves it.

That keeps the first release useful now and leaves a clean upgrade path to native Instinct comments later.
