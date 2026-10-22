---
description: '/scaffold-wp-theme writes the files WordPress needs to activate a block theme.'
tags: [command, theme, smoke]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

/scaffold-wp-theme

Theme name: Acme Docs. Text domain: acme-docs. No WooCommerce, no build tooling. Put it in `theme/`. Write the files to disk.
