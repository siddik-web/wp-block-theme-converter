---
description: '/convert-to-wp-theme uses the supplied theme identity.'
tags: [command, theme]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

/convert-to-wp-theme

Here's my portfolio site HTML. I want it to be a Gutenberg block theme. Theme name: "Portia". Author: Jane Doe.
Put the theme in `theme/`. Write the files to disk.

```html
<body>
  <nav class="main-nav">...</nav>
  <section id="work">
    <div class="project-card">...</div>
    <div class="project-card">...</div>
  </section>
  <section id="about">...</section>
  <section id="contact">...</section>
</body>
```
