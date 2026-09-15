---
title: The Agent Illustrator VM
subtitle: A cloud Illustrator worker for tech-pack edits, with the cost, license rules, and safety checks spelled out.
date: 2026-09-14
---

## Decision

If FORTYTWO stays on Illustrator, pilot **Azure Virtual Desktop in East US** with Windows 11 Enterprise, a Standard_D4as_v5 VM (4 vCPU, 16 GB RAM), and a 128 GB Premium SSD. Reach it only through Tailscale. Install Illustrator, Node 20 LTS, and `illustrator-mcp-server`. Start it when a job enters the queue and stop after 30 idle minutes.

This is the best Windows test because Illustrator supports Windows 10/11, while normal AWS Windows images are Windows Server. A GPU is not needed for text, tables, swatches, layers, saves, and PDF exports.

**Second choice:** a MacStadium M2 Mac mini with 16 GB RAM. It is simpler if Windows automation fails, but published pricing starts at $109 per month.

<div class="visual" aria-label="Monthly infrastructure cost comparison">
  <div class="visual-head"><h4>What the pilot costs</h4><span class="visual-label">Monthly signal</span></div>
  <div class="bar-row"><span>AVD pilot</span><div class="bar-track"><div class="bar-fill" style="--w: 36%"></div></div><b>$30–60</b></div>
  <div class="bar-row"><span>MacStadium</span><div class="bar-track"><div class="bar-fill" style="--w: 68%"></div></div><b>$109+</b></div>
  <div class="bar-row"><span>AVD always-on</span><div class="bar-track"><div class="bar-fill" style="--w: 100%"></div></div><b>$126+</b></div>
  <p class="visual-note">Rough monthly computer cost. Adobe and any new Microsoft license are extra.</p>
</div>

## Setup

1. **Controller:** checks the edit instructions, starts the VM, and opens a private Tailscale link.
2. **Workstation:** one-user Windows 11 VM. No public RDP or inbound internet rule.
3. **Illustrator link:** the community MCP server sends approved actions into Illustrator's script tools.
4. **Files:** every job has locked `input/`, working, output, and log folders. Never edit the only original.
5. **Output:** versioned `.ai`, PDF, before/after renders, hashes, and a change log.

| Option | Suggested setup | Price guide | Verdict |
|---|---:|---:|---|
| **Azure AVD** | D4as_v5, 4 vCPU/16 GB | About $0.172/hour base compute; Windows comparison about $0.356/hour; disk extra | **Primary** |
| AWS EC2 | m7i.xlarge, 4 vCPU/16 GB | About $0.2016/hour before Windows and storage | Windows 11 licensing is awkward |
| Paperspace | 4+ vCPU, 16+ GB | Hourly compute plus monthly storage/access | Easy to open, harder to audit and rebuild |
| MacStadium | M2 Mac mini, 16 GB | Starts at $109/month | **Second choice** |
| AWS Mac | mac2.metal | About $0.65/hour with a 24-hour host minimum | Too expensive for short daily jobs |

Move to 8 vCPU/32 GB only if a real heavy pack stays above 70% memory, export takes over five minutes, or saving becomes slow.

## License rules

- Adobe defines a computer as physical or virtual. One subscription can be active on two computers, but the apps cannot run on both at once.
- The VM uses one activation. If Milo's Mac is the first, the VM can be the second.
- Teams does not let two people share one seat at the same time. Milo and Kenny need separate seats for separate, simultaneous use.
- Adobe sign-in, MFA, or device-limit screens are human-only. Pause the job and let Milo sign in through private RDP.
- Before production, get Adobe's written answer on a dedicated AVD VM with named-user login and agent-triggered scripts. Also confirm the Windows and font licenses.

## Software

Install Creative Cloud, Illustrator, Node 20+, Git, Tailscale, PowerShell 7, the agent client, PDF render/diff tools, and the approved FORTYTWO fonts.

The supplied MCP project resolves to the maintained `ie3jp/illustrator-mcp-server`. Lock production to an exact commit and `package-lock.json`; do not follow `latest` silently. Build it, scan its dependencies, checksum it, and upgrade only after a known tech pack still passes.

## Job flow

1. Copy and hash the `.ai`; reject PDF-only input when native editing is required.
2. Open it, check fonts and linked assets, list pages/layers, and export a baseline PDF.
3. Turn the request into exact edits and a “do not touch” list.
4. Edit only named layers, text, artboards, or bounded objects. Save after each small batch.
5. Re-read changed objects, count them, and confirm protected layers did not change.
6. Export PDF and inspect every affected page at high zoom. Check overflow, red edits, glyphs, page numbers, and nearby content.
7. Return the versioned `.ai`, PDF, log, hashes, and anything left open.
8. Milo reviews the pilot PDF before any factory receives it. Factory sends remain separately approved.

Stop on missing fonts or links, duplicate text with no clear target, unknown pop-ups, save warnings, or unexpected object counts. Do not touch drawings or construction geometry unless the job says to.

## Reliability and cost

Start the VM per job and shut it down after 30 idle minutes. A few active hours do not justify 24/7 compute.

Automatic checks should cover VM reachability, Illustrator and MCP health, free disk above 20 GB, fonts, and links. Restart MCP once after failure. If Illustrator hangs, capture evidence, force-close once, and reopen the last confirmed save. Never press through an unknown pop-up.

Keep a clean machine image with no Adobe password or production file. Pin updates, snapshot first, and test a known pack after Windows, Illustrator, or MCP changes.

For 66 active hours per month:

| Line | Monthly estimate |
|---|---:|
| Azure compute | $11-$24 |
| 128 GB disk | $10-$20 |
| Backups, logs, traffic | $5-$15 |
| Tailscale | $0 for a small pilot, plan limits apply |
| **Computer total** | **$30-$60** |

Adobe and any new Microsoft license are extra. Set a $75 warning and review the setup at $100. Stop orphaned VMs every night.

## Build and test

1. Confirm Adobe activations, AVD entitlement, font rights, and Adobe's answer.
2. Build the private VM, storage, budget, backups, and auto-stop.
3. Milo signs into Adobe and installs approved fonts.
4. Lock the MCP version and add health, timeout, modal, save, export, and diff checks.
5. Pilot on **Raglan Sleeve Striped Polo V2** or another pack with known corrections.

The pilot passes only if every requested edit is correct and red, unrelated objects are unchanged, PDF pages have no overflow or missing glyphs, files are versioned, and the VM can stop, restart, and run again. Then compare 5-10 agent runs with Milo's manual results.

A working pilot takes about one focused day if licenses are ready. Testing and recovery work takes another 2-3 business days. Adobe's reply may take longer.

## Main risks

| Risk | Control |
|---|---|
| Adobe license or re-login problem | Stable VM, named user, written confirmation, human login |
| Community MCP bug | Locked commit, code review, allowlisted tools, immutable originals |
| Wrong duplicate object | Require page/layer/bounds; read back and render |
| Missing font or image | Stop rather than substitute |
| Update breaks the flow | Snapshot, known-pack test, rollback |
| VM leaks files or credentials | Encryption, least privilege, Tailscale, no public RDP, short retention |
| Unreviewed factory send | Keep editing and external delivery as separate approvals |

## Sources

1. Illustrator MCP server: https://github.com/sr1412/illustrator-mcp-server
2. Maintained MCP README: https://raw.githubusercontent.com/ie3jp/illustrator-mcp-server/main/README.md
3. Adobe product terms: https://wwwimages2.adobe.com/content/dam/cc/en/legal/servicetou/Software-Product-Specific-Terms-en_US-20240618.pdf
4. Adobe activation guidance: https://helpx.adobe.com/download-install/using/install-apps-number-of-computers.html
5. Illustrator system requirements: https://helpx.adobe.com/illustrator/system-requirements.html
6. Adobe Teams: https://www.adobe.com/creativecloud/business/teams/plans.html
7. Azure D4as_v5: https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/general-purpose/dasv5-series
8. AVD licensing: https://learn.microsoft.com/en-in/azure/virtual-desktop/licensing
9. Windows 11 virtual desktop licensing: https://www.microsoft.com/licensing/guidance/Windows-11-Licensing-for-Virtual-Desktops
10. Azure disk billing: https://learn.microsoft.com/en-us/azure/virtual-machines/disks-understand-billing
11. AWS EC2 pricing: https://aws.amazon.com/ec2/pricing/on-demand/
12. AWS Mac 24-hour minimum: https://aws.amazon.com/ec2/instance-types/mac/
13. Paperspace pricing: https://docs.digitalocean.com/products/paperspace/machines/details/pricing/
14. MacStadium pricing: https://macstadium.com/pricing
15. Tailscale RDP: https://tailscale.com/docs/solutions/access-remote-desktops-using-windows-rdp
