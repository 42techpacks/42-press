---
title: Moving FORTYTWO Tech Packs to Inkscape
subtitle: Why SVG is the safer working file for agent edits, and how to move the current Illustrator template without losing control.
date: 2026-09-14
---

## Decision

Move the FORTYTWO tech pack template from Illustrator to **Inkscape**. Keep the original `.ai` file as a locked reference. Build one checked `.svg` master, then use that SVG for future packs.

Inkscape is the best fit because its main file format is SVG. SVG is vector-based, but it is also text. An agent can inspect and edit the file without driving a design app through a fragile bridge. Inkscape can then export the finished pages to PDF from the command line.

This is not a promise that any `.ai` file will move over perfectly. The current template needs one careful migration pass. Every page must be checked beside the Illustrator original. After that, the daily workflow gets much simpler.

<div class="visual" aria-label="Software fit for agent-edited tech packs">
  <div class="visual-head"><h4>Fit for agent-edited tech packs</h4><span class="visual-label">Working-file test</span></div>
  <div class="bar-row"><span>Inkscape</span><div class="bar-track"><div class="bar-fill" style="--w: 94%"></div></div><b>Best</b></div>
  <div class="bar-row"><span>Figma</span><div class="bar-track"><div class="bar-fill" style="--w: 58%"></div></div><b>Beta</b></div>
  <div class="bar-row"><span>Affinity</span><div class="bar-track"><div class="bar-fill" style="--w: 44%"></div></div><b>Manual</b></div>
  <div class="bar-row"><span>CorelDRAW</span><div class="bar-track"><div class="bar-fill" style="--w: 40%"></div></div><b>Manual</b></div>
  <p class="visual-note">Score is based on file access, reliable automation, PDF output, and how much desktop-app control the agent needs. It is not a score for drawing by hand.</p>
</div>

## Why Illustrator is risky here

Illustrator is still a strong design tool. The risk comes from asking an agent to run it without a person at the desk.

### The license belongs to a named user

Adobe allows a person to activate a subscription on up to two computers, but the apps cannot be used on both at the same time. A cloud worker can use one activation. It can also trigger sign-in, device-limit, or MFA screens that only Milo should handle.

That means a job can stop even when the edit itself is simple.

### The bridge is another failure point

The current plan depends on a community MCP server that passes agent commands into Illustrator's script system. It must stay in sync with Illustrator, Node, the operating system, and the agent client.

A modal window, missing font, changed object name, app update, or bridge timeout can stop the run. The original must stay locked because a bad command could change the wrong object.

### Illustrator needs a desktop machine

A safe worker needs Windows 11 or macOS, enough memory, private remote access, snapshots, updates, and a recovery plan. The Azure pilot was estimated at about **$30-$60 per month** when it shuts down between jobs. An always-on machine costs more.

The cost is manageable. The bigger problem is the number of parts that can fail before one line of spec text changes.

## Why Inkscape wins

### SVG is a real vector file and readable text

Inkscape uses SVG as its main format. SVG is a W3C standard built from XML text. Paths, shapes, text, colors, strokes, images, and page data are stored as named objects and values.

That changes the agent workflow. Instead of clicking through a desktop app, the agent can:

1. copy the SVG;
2. find the exact text or object ID;
3. make a small change;
4. compare the file structure;
5. export a PDF;
6. render every page and check the pixels.

The file stays vector-based. The agent also gets normal code tools: diffs, version history, search, exact replacements, tests, and rollback.

### PDF export is built for automation

Inkscape has a command-line interface. It can export all pages or chosen pages to PDF without opening the full editor. It can also turn text into paths on export when a factory needs a safer handoff.

A basic export can be as simple as:

```bash
inkscape Tech-Pack.svg --export-type=pdf --export-filename=Tech-Pack.pdf
```

That is easier to repeat and test than a chain of remote clicks inside Illustrator.

### It runs almost anywhere

Inkscape is free and open source. It runs on macOS, Windows, and Linux. There is no Adobe activation, no named-user seat, and no cloud Mac requirement.

A small Linux worker can edit the SVG and export the PDF. Milo can still open the same SVG in the Inkscape desktop app when he wants to inspect or draw by hand.

### It handles the pieces a tech pack needs

Inkscape supports multi-page SVG documents and PDF export. It can place raster images inside the file. It can also work with common vector and image formats through its import and export tools.

For FORTYTWO, the important test is the real template: vector flats, measurement arrows, spec tables, placed sample photos, page numbers, swatches, and Redaction notes. Those should all work in SVG, but the migration test must prove it.

## The alternatives, honestly

| Software | Illustrator handoff | Images + PDF | Agent use | Verdict |
|---|---|---|---|---|
| **Inkscape** | Opens AI files that contain compatible PDF data, with limits; Illustrator can open SVG | Yes | Native SVG is text; strong CLI export and batch actions | **Best working format after one checked migration** |
| Affinity Designer | Strong desktop import/export tools and good linked or embedded resource control | Yes | Good for a person, but no plain-text native file and no first-party agent write path like SVG editing | Best manual alternative |
| CorelDRAW | Imports and exports AI; official docs list conversion limits | Yes | Has scripting, but still depends on a licensed desktop app and UI/runtime setup | Good conversion tool, weaker agent base |
| Figma | Best when the source is moved into Figma, not when `.ai` must remain the main handoff | Yes for normal design work and exports | First-party MCP writing exists, but it is beta and does not support images in agent writes yet | Promising later, not ready for these packs |

### Affinity Designer

Affinity Designer is strong for human editing. It supports artboards, vector tools, CMYK, linked or embedded resources, and professional PDF export. It may open a clean Illustrator file better than Inkscape in some cases.

But its native document is not readable text. An agent still needs the desktop app and a reliable way to control it. That keeps most of the same automation risk, even if the license is simpler than Adobe's.

### CorelDRAW

CorelDRAW has the clearest direct AI support of the alternatives. It can import and export AI files and run a preflight before export. It also supports PDF.

Its own help page lists the tradeoffs. AI import is documented through CS6. Some gradients can change. Patterns and 3D effects become curves. Blur, texture, shadows, and brush effects can become bitmap objects. Exported objects can also become hard to edit later.

CorelDRAW is useful if it opens this template more cleanly during migration. It is not the best final format for an agent because the work still lives inside a desktop app.

### Figma

Figma now has a first-party MCP tool that can write to the canvas. That is important. It means Figma may become a strong agent design tool.

It is not ready for this job today. Figma says the write tool is in beta, may need manual cleanup, and does not support images yet. Fonts must also be uploaded to the account. A tech pack with placed sample photos cannot depend on that path yet.

## The one catch: migration

Inkscape can open AI files when the file contains compatible PDF data, but the result is not guaranteed to be one-to-one. Inkscape's own Illustrator guide lists limits. Gradient meshes may be rebuilt as many small paths. Some transparency modes do not work. Illustrator-only data can also behave differently.

The safe move is not “open and hope.” It is a short migration project.

### Migration pass

1. Lock the current Illustrator template and export a reference PDF.
2. In Illustrator, save a copy with **Create PDF Compatible File** on. Also export a clean SVG copy with **Preserve Illustrator Editing** off.
3. Open both routes in Inkscape and choose the cleaner result.
4. Install every font used in the pack before judging layout.
5. Check every page at high zoom: page size, text wraps, tables, arrows, line weights, images, clipping masks, swatches, and layer order.
6. Give important objects stable IDs such as `page-06-chest-width`, `footer-page-number`, and `colorway-01-name`.
7. Embed placed images for a portable master, or keep a clear linked-assets folder with exact paths.
8. Export PDF from Inkscape and compare every page with the Illustrator reference.
9. Fix the SVG once, then save it as the new locked master.
10. Run one real pack, such as **Raglan Sleeve Striped Polo V2**, through both workflows before switching production.

Fonts are the main outside dependency. The worker and Milo's computer need the same licensed fonts. If a font is missing, stop the export. Do not accept a silent substitute.

## The safer agent workflow

Each edit should follow the same steps:

1. Copy the locked SVG master into a new product/version folder.
2. Hash the input and commit it to version history.
3. Change only named objects or exact text matches.
4. Mark review edits in red when Milo's workflow calls for it.
5. Run checks for missing fields, stale page numbers, known footer typos, and changed object counts.
6. Export the PDF with the Inkscape CLI.
7. Render every page and inspect the actual pixels.
8. Return the SVG, PDF, change list, and any issue that could not be checked.

A diff will show the exact SVG lines that changed. If the result is wrong, the last commit can be restored. This is much closer to normal code review than remote-control desktop editing.

## Recommendation

Use Inkscape as the new working system, but do not throw away Illustrator.

Keep the Illustrator template and reference PDF as the source used to judge the migration. Build one clean SVG master. Test it on **Raglan Sleeve Striped Polo V2** or another pack that already has a known correct result. If the exported pages match, move new FORTYTWO packs to SVG.

Use Affinity Designer or CorelDRAW only as a conversion helper if one of them opens a hard Illustrator object better. Revisit Figma when its agent write path supports images and leaves beta.

The goal is not to find a cheaper Illustrator clone. The goal is to use a file format the agent can edit, check, diff, export, and roll back without pretending a desktop app is a codebase. Today, that format is SVG, and Inkscape is the strongest editor around it.

## Sources

1. Inkscape command-line manual, including native SVG/XML, batch actions, multi-page support, and PDF export: https://inkscape.org/doc/inkscape-man.html
2. Inkscape guide for Illustrator users, including AI/PDF import and migration limits: https://wiki.inkscape.org/wiki/Inkscape_for_Adobe_Illustrator_users
3. Affinity Designer feature list, including artboards, vector tools, linked/embedded resources, CMYK, and import/export: https://affinity.help/designer2/English.lproj/pages/Introduction/keyFeatures.html?list=allFeatures
4. CorelDRAW AI import/export help and conversion notes: https://product.corel.com/help/CorelDRAW/Documentation-Windows/CorelDRAW-en/CorelDRAW-Adobe-Illustrator-AI.html
5. CorelDRAW PDF export help: https://product.corel.com/help/CorelDRAW/540227992/Main/EN/Documentation/CorelDRAW-Exporting-documents-as-PDF-files.html
6. Figma MCP FAQ, including write-to-canvas beta limits, image limits, font needs, and production safety advice: https://help.figma.com/hc/en-us/articles/39252411778583-Figma-MCP-server-FAQs
7. Figma static export help: https://help.figma.com/hc/en-us/articles/360040028114-Export-static-designs-from-Figma
