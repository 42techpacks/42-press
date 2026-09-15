---
title: The Agent Illustrator VM
date: 2026-09-14
subtitle: A clear plan for a cloud computer that can edit Illustrator tech packs without putting production files at risk.
---


## Decision

Build the pilot on **Azure Virtual Desktop (AVD), East US, Windows 11 Enterprise, Standard_D4as_v5 (4 vCPU, 16 GB RAM), 128 GB Premium SSD**, reached only over Tailscale. Install Illustrator, Node 20 LTS, and the `illustrator-mcp-server` package. Auto-start the machine when a revision job enters the queue and stop it after 30 idle minutes.

This is the best first setup. It gives Illustrator a supported desktop version of Windows, enough RAM for most FORTYTWO packs, hourly compute, snapshots, and clean automation. AWS EC2's normal Windows images are Windows Server, while current Illustrator requirements name Windows 10/11, not Windows Server. Paperspace is easier to open interactively but is less clean for automated setup and control and its attractive tiers are GPU-oriented, which this 2D workflow does not need. Mac cloud works, but hourly Macs cost too much and AWS Mac has a 24-hour minimum host allocation.

**Second choice:** MacStadium M2 Mac mini with 16 GB RAM. It is the simplest always-on supported desktop environment if Windows automation proves unreliable. Published Mac mini pricing starts at $109/month, with higher-memory configurations above that.

<div class="visual" aria-label="Monthly infrastructure cost comparison">
  <div class="visual-head"><h4>What the pilot costs</h4><span class="visual-label">Monthly signal</span></div>
  <div class="bar-row"><span>AVD pilot</span><div class="bar-track"><div class="bar-fill" style="--w: 36%"></div></div><b>$30–60</b></div>
  <div class="bar-row"><span>MacStadium</span><div class="bar-track"><div class="bar-fill" style="--w: 68%"></div></div><b>$109+</b></div>
  <div class="bar-row"><span>AVD always-on</span><div class="bar-track"><div class="bar-fill" style="--w: 100%"></div></div><b>$126+</b></div>
  <p class="visual-note">Rough monthly computer cost. This does not include Adobe or a new Microsoft license.</p>
</div>

> Start small, prove the real FORTYTWO workflow, and keep the expensive machine switched off when there is no revision in the queue.

## 1. Architecture and provider choice

### How it works

1. **Job controller:** an agent runner receives a revision request, checks the instructions, starts the VM if stopped, and opens a private link through Tailscale.
2. **Workstation:** single-user Azure AVD Windows 11 Enterprise VM, D4as_v5, 4 vCPU/16 GiB, 128 GiB SSD. No separate graphics processor for the pilot. Disable Illustrator GPU Performance if the virtual display adapter is unstable.
3. **Illustrator connection:** Illustrator plus the community `illustrator-mcp-server`. The server exposes Illustrator operations to an MCP client and runs through Illustrator's ExtendScript scripting interface.
4. **Job storage:** a private per-job folder in OneDrive/Google Drive or an Azure Storage staging container. The original `.ai` is copied into an locked `input/` folder; working and final files live under a unique job ID.
5. **Access:** Tailscale only. No public RDP listener and no inbound internet security-group rule. Emergency human access uses RDP over the tailnet.
6. **Output:** versioned `.ai`, exported PDF, run log a computer can read, before/after PDF renders, and a job record with source and output hashes.

### Provider comparison

| Option | Suggested setup | Current price guide | Fit | Verdict |
|---|---:|---:|---|---|
| **Azure AVD** | D4as_v5, 4 vCPU/16 GB | Linux/base compute is about $0.172/hour in East US; a license-included Windows Server D4as_v5 is about $0.356/hour. AVD Windows 11 requires an eligible per-user Windows/Microsoft 365 license. | Supported Windows 11 desktop, hourly stop/start, good image/snapshot tooling | **Primary** |
| AWS EC2 | m7i.xlarge, 4 vCPU/16 GiB | Base instance about $0.2016/hour in us-east-1 before Windows licensing; 128 GB gp3 storage extra | Strong automation, but standard EC2 Windows is Server and Windows 11 desktop Windows licensing is hard to manage | Do not pilot here |
| Paperspace Core | 4+ vCPU, 16+ GB target | Hourly compute plus a monthly storage/access fee; current catalog is centered on GPU machines | Fast interactive setup and unlimited bandwidth, but harder to audit and rebuild the same way | Third choice |
| MacStadium | M2 Mac mini, 16 GB target | Published configurations start at $109/month; 16 GB configurations cost more | Supported macOS, stable desktop, simple named-user install | **Runner-up** |
| AWS mac2.metal | 8 vCPU/16 GiB | Roughly $0.65/hour; **24-hour minimum Dedicated Host allocation** | Automatable and Apple hardware, but every allocation costs at least about $15.60 | Reject for daily burst use |

### Sizing

- **Pilot:** 4 vCPU, 16 GB RAM, 128 GB SSD.
- **When to upgrade:** move to 8 vCPU/32 GB if a real heavy pack exceeds 70% memory for a steady period, export time exceeds five minutes, or Illustrator pages/saves noticeably.
- **GPU:** not required for text, swatch, layer, table, save, and PDF-export revisions. Illustrator's documented GPU requirements matter for GPU Performance and more advanced effects. Keep GPU Performance off in the pilot and test it with real packs. Add a GPU VM only if the pilot shows incorrect rendering or unacceptable pan/export performance.

## 2. Adobe licensing

- Adobe's current product terms define a “Computer” as a physical **or virtual** device. A subscription can be activated on up to two computers, but the apps may not be used on both simultaneously.
- Milo's VM therefore consumes one activation. If his Mac is already one activation, the VM can be the second. The worker cannot use Illustrator at the same time that Milo uses it on his Mac with the same named-user seat.
- A third activation triggers a sign-out/deactivation flow. Rebuilding the VM can look like a new computer, so deauthorize the old image when practical and keep the image identity stable.
- **Teams does not let two people use one seat at the same time.** It adds Admin Console management, seat assignment/reassignment, one place for billing, and support. Every human user still needs a named-user seat, and each assigned user still has activation/concurrency limits. If Kenny and Milo both need independent simultaneous access, buy and assign separate Teams seats.
- Creative Cloud depends on online subscription validation and can present repeat sign-in or device-limit dialogs. Only a person should handle a login problem: alert Milo, open private RDP over Tailscale, let him complete login/MFA, then resume the queued job. Never store his Adobe password in a script or image.
- Before production, obtain written confirmation from Adobe sales/support that a dedicated AVD VM, named-user login, and agent-triggered scripting are acceptable for this workflow. Adobe permits named-user activation on virtual devices in its terms, but support for a specific virtual setup may get limited support.

## 3. VM software stack

### Operating system

Use **Windows 11 Enterprise 23H2 or 24H2 through Azure Virtual Desktop**, not Windows Server. The current Illustrator requirements page lists supported Windows 11 and Windows 10 releases. AVD requires an eligible license such as Microsoft 365 Business Premium/E3/E5 or Windows Enterprise/VDA per user. Check FORTYTWO's Microsoft entitlement before provisioning.

### What to install

- Adobe Creative Cloud Desktop and current stable Illustrator
- Node.js 20 LTS or later
- Git for Windows
- Tailscale
- MCP client/agent runner
- `illustrator-mcp-server`
- PowerShell 7
- PDF renderer and image-diff/check utilities
- Cloud-sync client only if used for handoff; otherwise use signed object-storage transfers
- FORTYTWO production font bundle with license records

### Checked ways to install MCP

The user supplied `github.com/sr1412/illustrator-mcp-server`. Its current page/README points to the active package and repo under `ie3jp/illustrator-mcp-server`; lock production to an exact release and commit. Do not silently follow `latest`.

**Claude Code:**

```powershell
claude mcp add illustrator-mcp -- npx illustrator-mcp-server
```

**Claude Desktop packaged extension:** download `illustrator-mcp-server.mcpb` from the repository's latest GitHub Release, open Claude Desktop Settings → Extensions, drag in the file, and install it. The README warns that `.mcpb` does not auto-update.

**Claude Desktop manual/npx configuration:**

```json
{
  "mcpServers": {
    "illustrator": {
      "command": "npx",
      "args": ["illustrator-mcp-server"]
    }
  }
}
```

**Locked production install (recommended):** clone an approved commit, run `npm install` and `npm run build`, then register `node C:\path\to\illustrator-mcp-server\dist\index.js`. Commit `package-lock.json`, check the build file hash, scan dependencies, and upgrade only after the test pack passes.

### Connectivity

- Join VM and agent runner to one private Tailscale tailnet.
- Turn on Tailscale ACLs so only the runner and named admins reach the VM.
- Block public inbound traffic at Azure NSG level. Do not expose TCP 3389.
- Use RDP over the VM's Tailscale IP only for setup, Adobe re-login, or modal recovery.
- Limit outgoing traffic where practical, while allowing Adobe, Microsoft, GitHub/npm, Tailscale, and the chosen file store.

### File transfer

Recommended production steps:

1. Agent creates `jobs/<job-id>/input`, `working`, `output`, and `logs`.
2. Upload original `.ai` to immutable `input/`; record its SHA-256 hash.
3. Copy to `working/`; never edit the source in place.
4. After save/export/verification, upload `.ai`, PDF, thumbnails, manifest, and log to `output/`.
5. Deliver Drive links to the final artifacts. Keep files private by default.

A synced Drive folder is acceptable for the pilot. Object storage with short-lived signed URLs and automatic deletion is safer for production because a sync problem cannot overwrite the source.

## 4. Agent workflow

### Steps for every job

1. **Intake:** receive the `.ai` plus a clear revision instructions. Reject PDF-only input when editing in Illustrator is required.
2. **Preflight:** duplicate the original, hash it, open it in Illustrator, confirm fonts and linked assets, list pages/artboards/layers, and save a baseline PDF.
3. **Plan:** translate instructions into bounded operations and a “do not touch” set. For the current FORTYTWO pattern: edit existing text in place; new or changed text is red; preserve font, size, position, and layer; do not modify drawings, vector construction, artboard size, or unrelated copy.
4. **Execute:** invoke only the required MCP tools. Save after logical batches. Use exact labels where possible: layer name, text contents, artboard, object bounds.
5. **Check the file structure:** re-read affected text/objects, check values, count changed objects, verify no protected layer changed, check for missing fonts and links, and compare document metadata.
6. **Check every page:** export PDF, render every affected page at high resolution, inspect placement, overflow, red text, glyphs, and nearby untouched content. Run whole-document text checks for stale values and repeated footer/page-number errors.
7. **Deliver:** save a new `.ai` revision, exported PDF, change log, and list of anything left open. Return links and a concise pass/fail report.
8. **Human gate:** for the pilot, Milo reviews the final PDF before it is sent to a factory. Once the test set is clean, simple, low-risk edits may finish on their own, but external factory sends stay separately authorized.

### Standing guardrails

- Never overwrite the only original.
- Never touch vector drawings, construction geometry, placed photos, or initial design decisions unless a job specifically authorizes them.
- Fail closed on missing fonts, missing linked assets, ambiguous duplicate text, unknown dialogs, save-format warnings, or unexpected object-count changes.
- Early design work and complex vector drafting remain human work. The system is for iterations, measurements, labels, color/text rules, revision notes, variants, page numbers, footers, and exports.

## 5. Keeping it reliable

### Runtime mode

Start with **job-triggered start plus 30-minute idle shutdown**. A few active hours per day do not justify 24/7 compute. Keep the OS disk and image while stopped. If cold start plus Illustrator startup slows the team too much, move to a weekday working-hours schedule, not 24/7.

### Watchdog and recovery

- Scheduled watchdog checks: VM reachable, Illustrator process alive, MCP health check responds, free disk >20 GB, font/link preflight clean.
- On MCP failure: restart MCP once. On Illustrator hang: capture screenshot and process dump, force it to close once, reopen the working copy, and resume only from the last confirmed save.
- Unknown pop-up window: capture screenshot, stop automation, alert a human. Do not blindly press Enter.
- Queue each file to one worker at a time. Illustrator is a desktop app, cannot handle several files at once.

### Rebuild under 30 minutes

- Base image contains patched Windows, Node, Git, Tailscale, monitoring, and scripts, but **no Adobe credentials or private production files**.
- Keep an Azure Compute Gallery image or managed image plus Infrastructure-as-Code for network, VM, disk, identity, NSG, schedules, and monitoring.
- Keep a separate encrypted data disk or cloud store for job data.
- Rebuild drill: provision from image, join tailnet, install/verify pinned MCP build, have Milo complete Adobe login, run smoke test. Adobe login time is dependent on a person and should not be counted as automatic rebuild time.

### Updates

- Windows: monthly planned update time, seven-day deferral after Patch Tuesday, snapshot first, run smoke pack after reboot.
- Illustrator/Creative Cloud: disable automatic major-version updates. Promote updates only after clone testing.
- MCP/npm: pin commit and lockfile; monthly dependency review; no unattended `latest` upgrades.
- Fonts: store one approved, versioned font bundle; document licenses; install system-wide; hash files; preflight every pack. Missing or substituted fonts is a reason to stop.

### Common problems

| Failure | How to spot it | What to do |
|---|---|---|
| Adobe sign-in/device-limit prompt | Window title/screenshot + MCP timeout | Pause, notify Milo, private RDP re-auth |
| Missing font/substitution | Illustrator preflight + text geometry change | Stop; install licensed font or ask designer |
| Missing linked image | Links status check | Stop; retrieve exact asset, never relink by filename guess |
| Save/legacy-format warning | Unexpected modal | Stop; human decides compatibility option |
| MCP/ExtendScript hang | Tool timeout + heartbeat failure | One controlled restart, reopen last saved copy |
| Windows/Illustrator update changes behavior | Golden-pack regression | Roll back snapshot/image |
| Sync conflict | duplicate/conflicted filename or hash mismatch | Use immutable input and job IDs; block delivery |
| Text overflow/missing glyph | high-res page render and bounds check | Reposition/shrink only if instruction permits; otherwise escalate |

## 6. Cost model

### Pilot, auto-stopped

Assume 3 active editing hours per weekday, 22 days/month = **66 compute hours**.

| Line | Estimate/month | Notes |
|---|---:|---|
| Azure D4as_v5 compute | $11-$24 | $0.172/hour base/AVD compute signal to $0.356/hour Windows-included comparison × 66 hours; actual AVD rate depends on entitlement and image |
| 128 GB SSD | $10-$20 | Standard SSD is around $9.60; Premium P10 around $19.71 in East US pricing examples |
| Snapshots/backups/logs/egress | $5-$15 | Depends on retained versions and file traffic |
| Tailscale | $0 for a small pilot | Subject to current user/device plan limits |
| Adobe | $0 incremental if existing second activation is available | Separate Teams seats cost extra if Milo and Kenny need simultaneous independent use |
| Eligible Windows/M365 license | $0 if already owned; otherwise plan-dependent | Confirm before build |
| **Expected computer total** | **$30-$60/month** | Excludes existing Adobe and any new Microsoft/Teams licenses |

### Always-on comparison

- Azure D4as_v5 base compute at 730 hours: about **$126/month**; Windows Server price with a license: about **$260/month**, plus disk/backups. Do not choose this for the pilot.
- MacStadium: **from $109/month**, likely higher for the recommended 16 GB configuration, but predictable and always available.
- AWS mac2.metal: about **$15.60 minimum each time a host is allocated**, even for a short job, because of the 24-hour minimum. Daily allocation is too expensive.

Set Azure Cost Management budgets at $75 warning and $100 required cost review. Add an automation check that shuts down orphaned VMs nightly.

## 7. Build plan

### Phase 0 - check licenses (Milo, 30-60 minutes)

1. Confirm current Adobe plan and which two devices are activated.
2. Confirm an eligible AVD Windows license or price Microsoft 365 Business Premium/Windows VDA.
3. Ask Adobe support to confirm this dedicated VM and agent-scripting use case in writing.
4. Confirm production font licenses permit installation on the cloud worker.

### Phase 1 - infrastructure (agent/engineer, 2-4 hours)

1. Create Azure resource group, VNet/NSG, private AVD host, D4as_v5 VM, 128 GB disk, managed identity, storage, budgets, and auto-shutdown.
2. Install Tailscale and verify RDP works only over the tailnet.
3. Create backup policy, image pipeline, logs, and rebuild script.
4. Create job-folder and hash/manifest scripts.

### Phase 2 - Milo-only interactive setup (30-60 minutes)

1. Milo signs into the Windows desktop over private RDP.
2. Milo installs/signs into Creative Cloud and Illustrator, completing MFA.
3. Milo installs or approves the licensed FORTYTWO fonts.
4. Sign out of any third Adobe activation if prompted.

### Phase 3 - MCP and automation (agent/engineer, 3-6 hours)

1. Install Node 20 LTS and Git.
2. Pin, build, and register the MCP server.
3. Enumerate its tools and map allowed operations for tech-pack edits.
4. Add health checks, tool timeouts, modal detection, save checkpoints, PDF export, rendering, and diff checks.
5. Build a structured job schema: input file, requested edits, red-change rule, protected layers/objects, expected pages, and output paths.

### Phase 4 - pilot (half day plus Milo review)

Use **one real, already-understood revision pack**, ideally the recent raglan-sleeve polo revision with known expected corrections.

Acceptance criteria:

- Correct `.ai` opens with no missing-font/link warnings.
- Every requested text/value change is correct and red.
- Drawings, unrelated text, layers, artboards, and linked assets are unchanged.
- PDF matches expected pagination and shows no overflow or glyph artifacts at high zoom.
- Source remains immutable; versioned `.ai`, PDF, manifest, hashes, and log are returned.
- VM can be stopped, restarted, and complete a second run.
- Milo spends less than five minutes supervising the run.

Then run 5-10 shadow jobs where the agent output is compared with Milo's manual result before allowing production use.

### Ownership

**The build/automation side can do:** cloud infrastructure, security, image, MCP install, workflow code, tests, job intake/output, watchdog, snapshots, and documentation.

**Milo must do:** Adobe purchase/plan decisions, Adobe login and MFA, device deactivation approval, Microsoft license decision, font-license confirmation, initial pack/design decisions, and pilot sign-off. Any factory send remains a separately authorized action.

**Elapsed time:** one focused day to stand up a working pilot if licenses are ready; 2-3 business days for monitoring, golden-pack tests, recovery scripts, and a ready-to-use setup. Adobe support confirmation may take longer.

## 8. Main risks

| Risk | Chance / harm | Control |
|---|---|---|
| Adobe licensing/ToS interpretation for autonomous use | Medium / High | Dedicated named-user VM, no concurrent use, written Adobe confirmation before production; do not share credentials |
| Adobe account/device flag or forced re-login | Medium / High | Stable VM identity, second-seat inventory, human re-auth runbook, alert on modal |
| Windows 11 AVD entitlement missing | Medium / Medium | Verify Microsoft license before build; MacStadium is fallback |
| Illustrator technically runs but virtual display/GPU behavior is wrong | Medium / Medium | Disable GPU Performance; pilot actual heaviest pack; add GPU only if evidence requires it |
| Community MCP supply-chain or destructive bug | Medium / High | Pin commit/lockfile, code review, dependency scan, allowlist tools, immutable originals, no silent upgrades |
| ExtendScript/API cannot address a specific Illustrator object reliably | Medium / Medium | Stable layer/object naming, preflight and fail closed; human handles complex drawings |
| Agent edits wrong duplicate text/object | Medium / High | Require artboard/layer/bounds context; structural readback plus visual diff |
| Credentials or production files exposed on cloud VM | Low-Medium / High | No credentials in image/scripts, disk encryption, least privilege, Tailscale, no public RDP, short retention, audit logs |
| Fonts cannot legally or technically be installed | Medium / High | License audit, approved font package, hash and preflight; stop on substitution |
| Windows/Adobe/npm update breaks automation | Medium / Medium | Pinned versions, staged updates, snapshot, test with a known pack, rollback |
| VM left running | Medium / Low | idle shutdown, nightly stop, budget alerts |
| Automation sends an unreviewed pack to a factory | Low / High | Separate editing from external delivery; explicit review/authorization gate |

## Sources

1. Illustrator MCP server repository and install README: https://github.com/sr1412/illustrator-mcp-server
2. Maintained README path surfaced by the repository/search result: https://raw.githubusercontent.com/ie3jp/illustrator-mcp-server/main/README.md
3. Adobe Software Product Specific Terms, including virtual/physical “Computer,” two activations, and non-simultaneous use: https://wwwimages2.adobe.com/content/dam/cc/en/legal/servicetou/Software-Product-Specific-Terms-en_US-20240618.pdf
4. Adobe activation guidance: https://helpx.adobe.com/download-install/using/install-apps-number-of-computers.html
5. Adobe Illustrator system requirements: https://helpx.adobe.com/illustrator/system-requirements.html
6. Adobe Creative Cloud for teams plans: https://www.adobe.com/creativecloud/business/teams/plans.html
7. Azure D4as_v5 specifications: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dasv5-series
8. Azure Virtual Desktop licensing: https://learn.microsoft.com/en-in/azure/virtual-desktop/licensing
9. Microsoft Windows 11 licensing for virtual desktops: https://www.microsoft.com/licensing/guidance/Windows-11-Licensing-for-Virtual-Desktops
10. Azure managed disk billing: https://learn.microsoft.com/en-us/azure/virtual-machines/disks-understand-billing
11. AWS EC2 on-demand pricing: https://aws.amazon.com/ec2/pricing/on-demand/
12. AWS M7i instances: https://aws.amazon.com/ec2/instance-types/m7i/
13. AWS EC2 Mac instances and 24-hour minimum: https://aws.amazon.com/ec2/instance-types/mac/
14. AWS EC2 Mac FAQ: https://aws.amazon.com/ec2/instance-types/mac/faqs/
15. Paperspace pricing: https://docs.digitalocean.com/products/paperspace/machines/details/pricing/
16. MacStadium pricing: https://macstadium.com/pricing
17. Tailscale RDP guidance: https://tailscale.com/docs/solutions/access-remote-desktops-using-windows-rdp
18. Azure D4as_v5 market price cross-check used for current East US estimates: https://www.economize.cloud/resources/azure/pricing/virtual-machine/d4asv5/
19. AWS m7i.xlarge market price cross-check: https://www.doit.com/compute/compute/aws/us-east-1/m7i.xlarge
