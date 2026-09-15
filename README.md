# 42 Press

Live reading page for specs and reports. Hosted on GitHub Pages at
https://42techpacks.github.io/42-press/

## Add a post

1. Create `_posts/YYYY-MM-DD-some-slug.md` with front matter:

   ```
   ---
   title: Post Title Here
   date: YYYY-MM-DD
   ---
   ```

   then the markdown body (tables and links render; keep one blank line
   around tables).

2. Commit to `main`. GitHub Pages rebuilds in about a minute; the post
   appears at `/42-press/some-slug/` and at the top of the index.

## Type

Body text is Redaction (Regular/Bold/Italic, self-hosted in
`assets/fonts/`, SIL OFL 1.1 — see `assets/fonts/OFL.txt`), falling back to
Georgia/serif.

## Publishing authentication

A repo-scoped fine-grained PAT is stored in Milo's vault as `GitHub 42 Press publish token`. It is restricted to the `42techpacks/42-press` repository with **Contents: read and write**. Use that saved credential for future commits instead of asking Milo to approve a new device-flow code.

## Refresh the work status page

The live desk is at `status.html`; all changing content lives in
`_data/status.yml`. The site is static, so the page shows the most recent
published snapshot rather than querying any private task system from the
browser.

For every refresh:

1. Read the current active task-agent and todo state from the source systems.
2. Replace `updated_at`, `summary`, and `items` in `_data/status.yml`.
3. Keep every public label generic. Never publish names of factories or other
   people, prices, account details, personal plans, message text, or private
   blockers. `note` should describe progress in one discreet sentence.
4. Use only these states: `working`, `waiting on Milo`, or `blocked`.
5. Preview `/status/` at desktop and phone widths, then commit both the data
   change and any related layout change to `main`.
6. Wait for GitHub Pages to finish and verify the live page before sharing it.

Most refreshes should change only `_data/status.yml`, which keeps updates fast
and avoids touching the page design.

The standing publisher refreshes this snapshot on every task lifecycle event:
start, completion, block, unblock, or any state change. Main sends the new
snapshot to the publisher, which updates `_data/status.yml`, pushes it at once,
and verifies the live page. Do not wait for a scheduled batch.

## Writing level

Write every 42 Press page for a high-school reader. Keep the same facts, numbers,
recommendations, warnings, and source links, but use short sentences and plain
words. Explain a technical term the first time it appears. This rule applies to
new posts and to edits of existing posts.

## Publisher routing

Keep 42 Press publishing with the existing standing publisher task so its
GitHub session can be reused. Route new posts, page changes, and status refreshes
to that publisher instead of starting a new publishing session.
