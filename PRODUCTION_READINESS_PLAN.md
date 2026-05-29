# Production Readiness Plan — WP Block Theme Converter Skill

**Status:** Proposed roadmap
**Current version:** 2.0.0
**Target version:** 3.0.0 (production-grade)
**Last updated:** 2026-05-29

---

## 1. What this project is (and why that frames "production grade")

This repo is **not a runtime application** — it is a [Claude Agent Skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview): a packaged bundle of `SKILL.md`, slash-command definitions, reference docs, and templates that teaches Claude how to convert HTML/CSS/JS into WordPress block themes.

So "production grade" here does **not** mean "add a database and a server." It means making the skill **reliable, verifiable, debuggable, and distributable** so that the themes it generates work the first time, and so the skill itself can be versioned, tested, and shipped like real software.

The skill today is strong on **prose guidance** (20 reference docs, 10 commands, 17 templates). Its gaps are everything *around* that guidance: there is nothing **executable**, nothing that **verifies output**, nothing that **tests the skill itself**, and nothing that turns the most common real-world failures into a guided fix.

---

## 2. Evidence: the problems this plan solves

### 2.1 What the WordPress community actually struggles with

From WordPress.org support, FSE troubleshooting guides, and developer write-ups, the recurring, highest-pain failures when building/converting block themes are:

1. **Cryptic block validation errors** — blank pages and error messages caused by whitespace/line-break differences in block markup, with the offending markup often not shown. ([fullsiteediting.com](https://fullsiteediting.com/lessons/troubleshooting-block-themes/))
2. **theme.json syntax & schema mistakes** — trailing commas, missing `"version"`, unquoted values, hardcoded hex instead of `var:preset|color|{slug}`, and forgetting `defaultPalette: false`. A single bad character silently breaks the whole file. ([brndle.com](https://brndle.com/theme-json-wordpress-global-settings-styles-guide/), [seahawkmedia.com](https://seahawkmedia.com/wordpress/theme-json-guide/))
3. **Patterns not showing in the inserter** — missing `register_block_pattern_category()`, misconfigured theme.json, or wrong file headers. ([nexterwp.com](https://nexterwp.com/blog/how-to-fix-wordpress-block-patterns/))
4. **DB templates silently override theme `.html` files** — edits saved in the Site Editor take precedence over the theme's files, so "my change isn't showing" is a top confusion. ([fullsiteediting.com](https://fullsiteediting.com/lessons/troubleshooting-block-themes/))
5. **Invalid block-support declarations → cryptic front-end PHP warnings** with no editor-visible error. ([fullsiteediting.com](https://fullsiteediting.com/lessons/troubleshooting-block-themes/))
6. **Scattered, incomplete FSE documentation** and a steep learning curve — the most-cited meta-complaint. ([blog.room34.com](https://blog.room34.com/8089/trials-and-tribulations-with-wordpress-block-themes-and-full-site-editing/))
7. **Page-builder lock-in** — huge volumes of real sites are on Elementor/Divi/WPBakery and people want a path off them into native block themes (high search/forum demand; partially covered today only for ACF/classic).

> The skill currently *describes* the right way to avoid #1–#6 in prose, but it cannot **detect** when output violates those rules, and it has **no guided remediation** when a user hits them on an existing site. That is the core production gap.

### 2.2 What Anthropic's skill best-practices call out as production requirements

From the [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) and [Equipping agents for the real world](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills):

- **Use scripts for deterministic operations** instead of asking the model to reason through them every time. ← we have zero scripts.
- **Ship an evaluation suite** (3–5 representative queries per skill: should-trigger, should-not-trigger, ambiguous). ← none exist.
- **Test across models** (Haiku/Sonnet/Opus) since effectiveness varies. ← untested.
- **Version, changelog, and pin** skills; author ≠ reviewer. ← no CHANGELOG, no version discipline beyond a number in README.
- **Be self-contained; no undocumented secrets/network.** ← currently true, keep it.
- **Package as a distributable artifact.** README references a `wp-block-theme-converter.skill` file but there is **no build script that produces it**.

---

## 3. Gap analysis (current → target)

| Area | Today | Production target |
|------|-------|-------------------|
| **Output verification** | Prose checklists only | Deterministic scripts the agent runs on generated themes (theme.json, block markup, pattern registration, i18n, escaping) |
| **Debugging real failures** | None | `/wp-debug` command + `troubleshooting.md` mapping symptoms → root cause → fix |
| **Page-builder migration** | ACF/classic only | Elementor / Divi / WPBakery / Gutenberg-classic playbooks + `/wp-migrate` extensions |
| **Skill self-testing** | None | `evals/` suite + runner; trigger/no-trigger/ambiguous cases |
| **Versioning & release** | Number in README | `CHANGELOG.md`, semver discipline, version in `SKILL.md` frontmatter, release notes |
| **Packaging/distribution** | Manual, build script missing | `scripts/build-skill.sh` producing `.skill`/zip; documented install for every host |
| **CI for the skill itself** | App-level CI templates exist (for *generated* themes) | CI that lints **this repo**: markdown lint, link check, script tests, eval smoke test, skill-structure validation |
| **Contribution safety** | "Submit improvements" prose | `CONTRIBUTING.md`, PR template, `LICENSE` file (only referenced today), author≠reviewer note |
| **Golden output** | Prompt examples only | At least one **fully generated** reference theme committed under `examples/` for regression/diffing |

---

## 4. The plan — prioritized workstreams

Priorities reflect the user's selected focus areas: **Output reliability, Debugging real errors, Page-builder migration, Skill quality infra.**

### P0 — Output reliability (deterministic verification scripts)

The single highest-leverage change. Move the "Quality Rules" and "Validation Checklist" from prose the model *should* follow into scripts the model *runs* and must pass.

- **`scripts/validate-theme-json.mjs`** — parse `theme.json`; assert: valid JSON (catch trailing commas), `"version": 3`, no hardcoded hex in `styles.*` (must use `var:preset|...`), `appearanceTools`/`useRootPaddingAwareAlignments` sanity, `defaultPalette` explicitly set, every `fontFace.src` path resolvable on disk. Validate against `https://schemas.wp.org/trunk/theme.json` when network is available; fall back to local schema copy when offline (skill must work without network).
- **`scripts/lint-block-markup.mjs`** — scan `parts/`, `templates/`, `patterns/` for: inline `style=""`, `<style>`/`<script>` tags, unescaped PHP echo in patterns, physical CSS properties, and block-comment delimiter integrity (the #1 cause of validation errors).
- **`scripts/check-patterns.mjs`** — confirm every pattern file has a valid header, a registered category, and a unique slug → directly prevents "patterns not showing."
- **`scripts/check-i18n.mjs`** — flag user-facing strings not wrapped in i18n functions and detect the `esc_html(__())` anti-pattern.
- **`scripts/doctor.mjs`** — umbrella runner that executes all of the above against a theme directory and prints a pass/fail report. SKILL.md's Step 5 (Verify) instructs Claude to run this and **loop until it passes** before declaring done.

> Design constraint: pure Node (no npm install needed), zero network dependency, offline schema fallback, exit-code driven so CI and the agent both consume them.

### P1 — Debugging real errors (`/wp-debug` + troubleshooting reference)

Turn the community's top pain points into a guided diagnostic flow.

- **`commands/wp-debug.md`** — new slash command: user pastes a symptom (blank page, "this block contains unexpected or invalid content", pattern missing, PHP warning, edits not showing) → Claude runs a decision tree → identifies root cause → applies the minimal fix.
- **`references/troubleshooting.md`** — symptom → cause → fix table covering: block validation/whitespace errors, theme.json silent failures, DB-template-overrides-file confusion (with the "clear customizations / export from Site Editor" workflow), invalid block-support PHP warnings, caching/specificity conflicts, pattern registration failures.
- Cross-link from `SKILL.md`, `README.md` troubleshooting section, and `validation-checklist.md`.

### P2 — Page-builder migration

Extend migration beyond classic/ACF to the builders that dominate the installed base.

- **`references/page-builder-migration.md`** — per-builder playbooks: **Elementor**, **Divi**, **WPBakery**, **Beaver Builder**, plus classic **Gutenberg-in-classic-theme**. Cover: shortcode/widget inventory, content extraction strategy, mapping builder modules → core blocks/patterns, handling builder CSS, and a "what cannot be auto-migrated" honesty section.
- Extend **`commands/wp-migrate.md`** with a builder-detection step and links into the new reference.
- One worked example: **`examples/elementor-to-block-theme.md`**.

### P3 — Skill quality infrastructure

Make the skill itself testable, versioned, and shippable.

- **`evals/`** — representative cases per command (should-trigger / should-not-trigger / ambiguous), plus a lightweight `evals/README.md` describing how to run them across Haiku/Sonnet/Opus and what "pass" means.
- **`scripts/validate-skill.mjs`** — structural lint of *this repo*: SKILL.md frontmatter present & well-formed, every command referenced in SKILL.md exists in `commands/`, every reference linked exists, no dead internal links, description within length budget.
- **`scripts/build-skill.sh`** — produce the distributable `.skill`/zip artifact the README already promises; stamp version from frontmatter.
- **`CHANGELOG.md`** — adopt Keep-a-Changelog + semver; backfill 1.x→2.0 history from git log.
- **`CONTRIBUTING.md`**, **`.github/PULL_REQUEST_TEMPLATE.md`**, and a real **`LICENSE`** file (MIT is referenced but no file exists).
- **`.github/workflows/skill-ci.yml`** — CI for this repo: run `validate-skill`, markdown-lint, link-check, the P0 scripts against the committed golden theme, and an eval smoke test. (Distinct from the existing `templates/github-actions-ci.yml.tpl`, which is CI for *generated* themes.)
- Move `Version` into `SKILL.md` frontmatter as the single source of truth; README reads from it.

### P4 — Golden output & docs polish (supporting)

- **`examples/_generated/landing-page-theme/`** — one **complete, generated** reference theme committed to the repo. Doubles as (a) a copy-paste starting point and (b) the fixture the P0 scripts and CI run against for regression detection.
- Tighten README: add a "Production / Reliability" section pointing at `doctor.mjs`, `/wp-debug`, and the changelog; fix the install instructions to reference the real build artifact.

---

## 5. Sequencing & milestones

| Milestone | Contents | Outcome |
|-----------|----------|---------|
| **M1 — Verify** | P0 scripts + `doctor.mjs` + SKILL.md Step 5 wiring + golden theme fixture | Generated themes are machine-verified; regressions caught |
| **M2 — Debug** | `/wp-debug` + `troubleshooting.md` | Users can self-resolve the top community failures |
| **M3 — Migrate** | Page-builder migration reference + `/wp-migrate` extension + Elementor example | Captures the largest real-world demand segment |
| **M4 — Ship** | evals, `validate-skill.mjs`, `build-skill.sh`, CHANGELOG, LICENSE, CONTRIBUTING, skill CI | Skill is versioned, tested, and distributable → **3.0.0** |

Each milestone is independently shippable and independently valuable.

---

## 6. Definition of "production grade" (acceptance criteria)

The skill is production grade when **all** of the following are true:

- [ ] Running `node scripts/doctor.mjs <theme-dir>` exits non-zero on any theme that violates the Quality Rules, and zero on a clean theme.
- [ ] SKILL.md Step 5 instructs Claude to run `doctor.mjs` and not declare success until it passes.
- [ ] `/wp-debug` exists and resolves each of the 6 documented top failures end-to-end.
- [ ] Page-builder migration is documented for Elementor, Divi, and WPBakery with one worked example.
- [ ] `evals/` contains trigger/no-trigger/ambiguous cases for every command and a documented way to run them.
- [ ] `scripts/validate-skill.mjs` passes and is enforced in CI on every PR.
- [ ] `scripts/build-skill.sh` produces an installable artifact matching the README's install instructions.
- [ ] `CHANGELOG.md`, `LICENSE`, and `CONTRIBUTING.md` exist; version lives in SKILL.md frontmatter.
- [ ] One complete generated reference theme is committed and is the CI regression fixture.
- [ ] Everything runs **offline** with **no secrets** (Anthropic self-contained requirement).

---

## 7. Non-goals (explicitly out of scope)

- Turning this into a hosted web service or SaaS — it is a skill, it stays a skill.
- Bundling a PHP/WordPress runtime. Scripts validate **statically**; we do not spin up WP.
- Adding speculative theme features (dark mode, WooCommerce, etc.) to the skill's *defaults* — Principle 2 (Simplicity First) still governs generated output.
- Auto-migrating builder content that genuinely requires human judgment — we document the boundary honestly instead of pretending.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Validation scripts drift from prose rules | Single source of truth: scripts cite the rule IDs in `quality-rules.md`; CI fails if a rule has no script or vice-versa |
| Network-dependent schema validation breaks offline use | Vendor a local copy of `theme.json` schema; network check is best-effort only |
| Page-builder migration over-promises | Explicit "cannot be auto-migrated" section; `/wp-debug` honesty principle |
| Eval suite rots | Run evals in CI smoke test; treat eval failures as release blockers |
| Skill grows too large for context | Keep scripts/evals out of the model's loaded context (they're executed, not read); progressive disclosure unchanged |

---

## 9. Project TODO list

### P0 — Output reliability
- [ ] Write `scripts/validate-theme-json.mjs` (JSON validity, version 3, no hardcoded hex, defaultPalette set, fontFace paths resolve, offline schema fallback)
- [ ] Write `scripts/lint-block-markup.mjs` (inline styles/scripts, unescaped echo, physical CSS, block-delimiter integrity)
- [ ] Write `scripts/check-patterns.mjs` (header, category registration, unique slug)
- [ ] Write `scripts/check-i18n.mjs` (unwrapped strings, `esc_html(__())` anti-pattern)
- [ ] Write `scripts/doctor.mjs` umbrella runner with pass/fail report + exit codes
- [ ] Wire `doctor.mjs` into SKILL.md Step 5 "Verify" with loop-until-pass instruction
- [ ] Vendor local `theme.json` schema copy for offline validation

### P1 — Debugging real errors
- [ ] Author `commands/wp-debug.md` (symptom → decision tree → fix)
- [ ] Author `references/troubleshooting.md` (symptom/cause/fix table for the 6 top failures)
- [ ] Cross-link troubleshooting from SKILL.md, README, validation-checklist
- [ ] Add `/wp-debug` to README + SKILL.md command tables

### P2 — Page-builder migration
- [ ] Author `references/page-builder-migration.md` (Elementor, Divi, WPBakery, Beaver Builder, Gutenberg-classic)
- [ ] Extend `commands/wp-migrate.md` with builder detection + links
- [ ] Add `examples/elementor-to-block-theme.md` worked example
- [ ] Add "what cannot be auto-migrated" honesty section

### P3 — Skill quality infrastructure
- [ ] Create `evals/` with trigger/no-trigger/ambiguous cases per command + `evals/README.md`
- [ ] Write `scripts/validate-skill.mjs` (frontmatter, command/reference existence, dead-link check, description budget)
- [ ] Write `scripts/build-skill.sh` (produce `.skill`/zip, stamp version from frontmatter)
- [ ] Add `CHANGELOG.md` (Keep-a-Changelog + semver; backfill history)
- [ ] Add real `LICENSE` file (MIT)
- [ ] Add `CONTRIBUTING.md` + `.github/PULL_REQUEST_TEMPLATE.md` (note author≠reviewer)
- [ ] Add `.github/workflows/skill-ci.yml` (validate-skill, md-lint, link-check, P0 scripts on golden theme, eval smoke test)
- [ ] Move `Version` into SKILL.md frontmatter as single source of truth

### P4 — Golden output & docs polish
- [ ] Commit one complete generated reference theme under `examples/_generated/`
- [ ] Use the golden theme as the CI regression fixture for P0 scripts
- [ ] Add "Production / Reliability" section to README
- [ ] Fix README install instructions to reference the real build artifact

### Release
- [ ] Run full eval suite across Haiku/Sonnet/Opus; record results
- [ ] Tag and release **v3.0.0** with CHANGELOG notes

---

## Sources

- [Skill authoring best practices — Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Agent Skills overview — Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Equipping agents for the real world with Agent Skills — Anthropic](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Troubleshooting block themes — Full Site Editing](https://fullsiteediting.com/lessons/troubleshooting-block-themes/)
- [Trials and tribulations with WordPress Block Themes and FSE — room34](https://blog.room34.com/8089/trials-and-tribulations-with-wordpress-block-themes-and-full-site-editing/)
- [theme.json WordPress Settings guide — Brndle](https://brndle.com/theme-json-wordpress-global-settings-styles-guide/)
- [theme.json Guide — Seahawk Media](https://seahawkmedia.com/wordpress/theme-json-guide/)
- [How to Fix WordPress Block Patterns Not Showing — NexterWP](https://nexterwp.com/blog/how-to-fix-wordpress-block-patterns/)
