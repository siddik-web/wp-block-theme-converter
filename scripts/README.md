# Theme Quality Scripts

`doctor.mjs` is an umbrella runner that executes all four theme-quality checks in sequence and prints a pass/fail summary table.

## Usage

```
node scripts/doctor.mjs path/to/theme
```

If no path is given, it defaults to the current working directory.

## What it runs

| Script | Checks |
|---|---|
| `validate-theme-json` | Validates `theme.json` structure, version, settings, font files, and template parts |
| `lint-block-markup` | Lints HTML/PHP in `templates/`, `parts/`, `patterns/` for inline styles, unescaped PHP, and block delimiter mismatches |
| `check-patterns` | Verifies block pattern PHP files have required header fields (Title, Slug, Categories) and no duplicate slugs |
| `check-i18n` | Scans PHP files for unwrapped user-facing strings, double-escaping, and missing text-domains |

## Exit codes

`doctor.mjs` exits `0` only when all four scripts pass. Individual scripts exit with the number of failures (capped at 127). All scripts are pure Node.js stdlib — no `npm install` required.
