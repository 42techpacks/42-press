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
