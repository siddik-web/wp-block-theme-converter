---
description: 'CSS custom properties are mapped into theme.json presets, not CSS.'
tags: [trigger, theme-json, smoke]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Here's a CSS file with design tokens for my brand:

```css
:root {
  --color-primary: #1a56db;
  --color-secondary: #7e3af2;
  --color-text: #111827;
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Merriweather', serif;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
}
```

Turn these tokens into the theme.json for my WordPress block theme and save it as `theme.json`. Nothing else.
