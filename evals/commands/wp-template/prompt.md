---
description: '/wp-template converts a page into an FSE template using template parts.'
tags: [command, template]
max_turns: 15
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

/wp-template

Convert this About page into an FSE template saved as `templates/page-about.html`. Theme slug: acme.

```html
<header class="site-header">...</header>
<main>
  <h1>About us</h1>
  <p>We build developer tools.</p>
</main>
<footer class="site-footer">...</footer>
```
