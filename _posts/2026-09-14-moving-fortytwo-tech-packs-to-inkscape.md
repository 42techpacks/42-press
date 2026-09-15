---
title: Moving FORTYTWO Tech Packs to Inkscape
subtitle: Why SVG is safer for agent edits, and how to move the Illustrator template without losing control.
date: 2026-09-14
---

## Decision

Move the FORTYTWO tech pack template to **Inkscape**. Keep the `.ai` file and its PDF as locked references. Build one checked `.svg` master, then use SVG for new packs.

Why: SVG is vector-based text. An agent can edit exact objects, show a diff, roll back mistakes, and export PDF from the command line. No Adobe activation, cloud desktop, or fragile Illustrator bridge is needed.

The catch: `.ai` import is close, not exact. The template needs one side-by-side migration pass, and every required font must be installed.

<div class="visual" aria-label="Software fit for agent-edited tech packs">
  <div class="visual-head"><h4>Fit for agent-edited tech packs</h4><span class="visual-label">Working-file test</span></div>
  <div class="bar-row"><span>Inkscape</span><div class="bar-track"><div class="bar-fill" style="--w: 94%"></div></div><b>Best</b></div>
  <div class="bar-row"><span>Figma</span><div class="bar-track"><div class="bar-fill" style="--w: 58%"></div></div><b>Beta</b></div>
  <div class="bar-row"><span>Affinity</span><div class="bar-track"><div class="bar-fill" style="--w: 44%"></div></div><b>Manual</b></div>
  <div class="bar-row"><span>CorelDRAW</span><div class="bar-track"><div class="bar-fill" style="--w: 40%"></div></div><b>Manual</b></div>
  <p class="visual-note">Based on file access, automation, PDF output, and how much desktop control the agent needs. This is not a score for drawing by hand.</p>
</div>

## Why leave Illustrator

Illustrator is good design software. It is risky as an unattended worker:

- **License and login:** the VM uses one named-user activation. Adobe allows two activated computers, but not use on both at once. Sign-in, MFA, and device-limit screens can stop a job.
- **Fragile bridge:** the community MCP server must stay in sync with Illustrator, Node, the operating system, and the agent client. Pop-ups, updates, missing fonts, object-name changes, or timeouts can break a run.
- **Desktop cost:** the safe Azure VM plan needs Windows 11, private access, snapshots, updates, and recovery. It was estimated at **$30-$60 per month** when stopped between jobs. Always-on costs more.

The problem is less the bill than the number of things that can fail before one spec line changes.

## Why Inkscape wins

Inkscape is free, open source, and runs on macOS, Windows, and Linux. Its main format, SVG, is a W3C XML standard. Paths, text, colors, strokes, images, and page data are stored as readable objects and values.

That gives the agent normal code tools: search, exact edits, diffs, version history, tests, and rollback. The file stays vector-based.

Inkscape also has batch actions and multi-page PDF export:

```bash
inkscape Tech-Pack.svg --export-type=pdf --export-filename=Tech-Pack.pdf
```

It can place raster images, handle multi-page SVG documents, and turn text into paths for a safer factory PDF. The real FORTYTWO test must still check vector flats, tables, arrows, photos, page numbers, swatches, masks, and layer order.

## Alternatives

| Software | Illustrator handoff | Agent fit | Verdict |
|---|---|---|---|
| **Inkscape** | Opens AI/PDF-compatible data with limits; Illustrator opens SVG | Native file is text; strong CLI and PDF export | **Best after one checked migration** |
| Affinity Designer | Strong desktop import/export; linked and embedded resources | Good manual editor, but its native file is not readable text | Best manual option |
| CorelDRAW | Direct AI import/export and preflight | Scriptable, but still a licensed desktop app | Useful conversion helper |
| Figma | Better after moving the source into Figma | First-party MCP writing is beta and cannot write images yet | Revisit later |

**Affinity Designer** supports artboards, vectors, CMYK, resources, and PDF. It may open some Illustrator objects more cleanly, but an agent still needs desktop control.

**CorelDRAW** has direct AI support, but its docs list limits: AI import through CS6; some gradients may change; patterns and 3D effects become curves; blur, texture, shadows, and brushes may become bitmaps; exported objects can become hard to edit.

**Figma** has first-party MCP canvas writing, but Figma calls it beta, says output may need cleanup, and does not support images in agent writes yet. Fonts must be uploaded. That blocks photo-heavy tech packs today.

## One migration pass

1. Lock the Illustrator template and export a reference PDF.
2. Save an AI copy with **Create PDF Compatible File** on. Also export SVG with **Preserve Illustrator Editing** off.
3. Open both in Inkscape and keep the cleaner result.
4. Install every required font.
5. Check every page at high zoom: size, text wraps, tables, arrows, line weights, images, masks, swatches, and layer order.
6. Give key objects stable IDs such as `page-06-chest-width` and `footer-page-number`.
7. Embed images, or keep an exact linked-assets folder.
8. Export PDF and compare every page with the Illustrator reference.
9. Fix the SVG once and lock it as the master.
10. Run **Raglan Sleeve Striped Polo V2** through both workflows before switching production.

Inkscape notes two important import limits: gradient meshes may become many small paths, and some transparency modes do not work. Missing fonts are a stop condition, not a reason to accept substitution.

## Working rule

For each pack: copy the master, hash and version it, edit only named objects, run text and object-count checks, export PDF, inspect every rendered page, then return the SVG, PDF, and change list.

Use Affinity or CorelDRAW only if one opens a hard Illustrator object better during migration. Revisit Figma when its write path supports images and leaves beta.

The goal is not a cheaper Illustrator clone. It is a file the agent can edit, check, diff, export, and restore. Today, that is SVG in Inkscape.

## Sources

1. Inkscape CLI, SVG/XML, batch actions, multi-page support, and PDF export: https://inkscape.org/doc/inkscape-man.html
2. Inkscape's Illustrator migration notes: https://wiki.inkscape.org/wiki/Inkscape_for_Adobe_Illustrator_users
3. Affinity Designer features: https://affinity.help/designer2/English.lproj/pages/Introduction/keyFeatures.html?list=allFeatures
4. CorelDRAW AI import/export limits: https://product.corel.com/help/CorelDRAW/Documentation-Windows/CorelDRAW-en/CorelDRAW-Adobe-Illustrator-AI.html
5. CorelDRAW PDF export: https://product.corel.com/help/CorelDRAW/540227992/Main/EN/Documentation/CorelDRAW-Exporting-documents-as-PDF-files.html
6. Figma MCP limits: https://help.figma.com/hc/en-us/articles/39252411778583-Figma-MCP-server-FAQs
7. Figma static export: https://help.figma.com/hc/en-us/articles/360040028114-Export-static-designs-from-Figma
