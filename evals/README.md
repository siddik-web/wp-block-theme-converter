# Evals — wp-block-theme-converter

Behavioral tests for the plugin, in the format `claude plugin eval` runs. Each case is a realistic prompt plus graders that check what Claude produced.

There are 21 cases in four groups:

| Group | Cases | What it checks |
|---|---|---|
| `commands/` | one per slash command (11) | The command's workflow writes the right files: pattern slug and translatable strings, a v3 `theme.json`, a titled style variation, an `apiVersion` 3 `block.json`, and so on |
| `triggers/` | natural-language requests (4) | The skill loads from plain phrasing and the output meets the quality rules |
| `negative/` | React, HTML→PDF, WordPress *plugin* (3) | The skill does **not** fire on look-alike requests |
| `ambiguous/` | "Make this into WordPress." and similar (3) | Claude asks a clarifying question instead of generating a theme |

## Layout

```text
evals/<group>/<case>/
├── prompt.md          # frontmatter: tags, max_turns, timeout_seconds, allowed_tools; body: the prompt
└── graders/
    └── <name>.md      # frontmatter: type + options; body: rubric (llm graders)
```

Grader types in use: `regex` (over the last message or a produced file), `tool_used` (was the skill invoked, or not), `file_exists`, and `llm` (a judge model scores a short rubric).

## Checking the suite (free, offline)

```bash
node scripts/validate-evals.mjs
```

This verifies frontmatter keys, grader types, regex syntax, run limits, and that **every command in `commands/` has a case in `evals/commands/`**. CI runs it on every push.

## Running the evals (uses model calls)

Needs Claude Code 2.1.269 or later, git 2.31 or later, and your normal Claude credentials. Every run is a real model call that counts against your plan or API bill: the full suite is roughly 21 cases × 3 runs × 2 arms (with and without the plugin) plus judge calls, so start small.

```bash
# One case, one run, no no-plugin baseline (cheap; use while iterating)
claude plugin eval . --case wp-pattern --runs 1 --ablation none --allow-tools Write Edit

# Whole suite, 3 runs per case, with the no-plugin baseline
claude plugin eval . --allow-tools Write Edit --threshold 0.8 --max-cost-usd 20
```

Notes:

- `--case` takes one glob and the last one wins, so run cases one at a time or use a pattern such as `'wp-*'`.
- Cases that write files need `--allow-tools Write Edit`; without it Claude cannot write and those graders fail.
- Reports land in `evals/results/` (git-ignored). Add `--no-publish` to keep them local.
- `tool_used: Skill` graders are plugin-fired *indicators* in a two-arm run: they show whether the skill loaded but do not count toward the score. A case where they fail while the other graders pass means Claude did the task without loading the skill, which is a signal to improve the skill `description`.
- To run the suite in GitHub Actions, trigger the **Evals** workflow by hand (it needs an `ANTHROPIC_API_KEY` repository secret and is never run automatically).

## Adding a case

1. Create `evals/commands/<command-name>/` (or another group) with `prompt.md` and at least one grader in `graders/`.
2. Phrase the prompt the way a user would type it, and put everything Claude needs in the prompt: each run starts in an empty directory.
3. Grade the result *and* the path: a `regex`/`file_exists` grader on what was produced, plus a `tool_used` grader for the skill where relevant.
4. Prefer deterministic graders. Use `llm` only for short, concrete PASS/FAIL rubrics.
5. Run `node scripts/validate-evals.mjs`, then run the new case once with `claude plugin eval`.

A new command without a case fails `validate-evals.mjs` and CI.
