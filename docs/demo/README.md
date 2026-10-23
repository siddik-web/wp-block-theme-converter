# How the demo was made

The video and GIF in the main README show a real run of this plugin. Nothing in them is staged or hand-edited.

## What happened

1. **Input:** [`examples/demo/source/`](../../examples/demo/source/) is a self-contained landing page (HTML, CSS, a small script, SVG images, no network dependencies).
2. **Conversion:** Claude Code ran non-interactively with the plugin loaded:

   ```bash
   claude -p "/wp-block-theme-converter:convert-to-wp-theme …" --plugin-dir . --permission-mode acceptEdits
   ```

   The prompt gave a theme name and asked it not to ask questions. The run took 15 turns and about $1.20 of API usage.
3. **Output:** [`examples/demo/northstar-theme/`](../../examples/demo/northstar-theme/) is the theme it wrote, unedited: 42 files, including seven editable section patterns, header and footer template parts, a front page, fallback templates and a `theme.json` built from the page's CSS variables.
4. **Verification:** the command ran the bundled doctor on the theme inside the session, and I ran it again afterwards. Both passed all five checks. CI runs it on this theme too.
5. **Preview:** the theme was installed in a local WordPress 6.6 (PHP 8.3, SQLite) with `WP_DEBUG` on. The debug log stayed empty and headless Chromium took the screenshots.

## What the video shows

| Scene | Source |
|---|---|
| Terminal | The recorded event stream, condensed by [`build-session.mjs`](../../scripts/demo/build-session.mjs): consecutive tool calls of one kind are grouped, file reads and writes are listed as such, and timing is compressed. The doctor table and the closing message are Claude's actual output. [`session.json`](session.json) is the condensed recording. |
| Before and after | A screenshot of `source/index.html` next to a screenshot of the WordPress front page. |
| Scroll | The same WordPress page, labelled with the pattern file behind each section. The mapping comes from the theme's own `templates/front-page.html`. |

## Honest notes

- **Close, not identical.** In WordPress the hero subtitle and the feature-card headings render larger than in the source page, and the brand name in the header is underlined. The structure, colors, spacing and content match; the typography is not pixel-perfect.
- **Older WordPress.** The preview uses WordPress 6.6, the oldest release this theme supports (`Requires at least: 6.6`), because that was the newest build available offline when the demo was recorded.
- **Two earlier runs found real bugs.** The first runs skipped the doctor, because no command file told Claude to run it. They also exposed two false positives in the doctor itself: hidden patterns were required to have categories, and code samples were flagged as untranslated text. All three are fixed in the same change as this demo, and a new check keeps theme-generating commands from skipping the doctor again. The recorded run is the first one made after those fixes.
- **Not a Site Editor walkthrough.** The preview is the front end only.

## Regenerating it

Needs Node 20 or later, Playwright with Chromium, ffmpeg, and a local WordPress to screenshot (this repo does not include one).

```bash
# 1. Convert (any scratch directory containing a copy of examples/demo/source as ./source)
claude -p "$(cat prompt.txt)" --plugin-dir /path/to/this/repo --permission-mode acceptEdits \
  --allowedTools Read Write Edit Glob Grep Skill Bash --output-format stream-json --verbose > events.jsonl

# 2. Condense the recording
node scripts/demo/build-session.mjs events.jsonl . session.json --prompt prompt.txt

# 3. Screenshot the page running in WordPress and map sections to pattern files
node scripts/demo/capture.mjs --url http://localhost:8899/ --out wordpress-page.png \
  --theme-dir northstar-theme --sections-out sections.json

# 4. Render the frames and encode MP4 and GIF
node scripts/demo/render-demo.mjs --session session.json --source-shot source-page.png \
  --wp-shot wordpress-page.png --sections sections.json --out-dir out --facts "…" --footer "…"
```
