---
type: llm
focus: last_message
---

PASS if the reply asks at least one clarifying question about what the user wants (what to convert or build, the
source files, or the kind of WordPress output) and does not output theme files (no theme.json, no style.css theme
header, no block markup).
FAIL if it picks an interpretation and generates theme code or a file structure without asking.
