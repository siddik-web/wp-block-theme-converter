---
description: 'Natural-language request with HTML source triggers the skill and produces a valid block theme.'
tags: [trigger, theme]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

I have a static landing page built in HTML and CSS. Here's the HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Acme SaaS</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header"><nav>...</nav></header>
  <section class="hero">
    <h1>Ship faster.</h1>
    <p>The dev tool that gets out of your way.</p>
    <a href="#pricing" class="btn-primary">Start free trial</a>
  </section>
  <footer>...</footer>
</body>
</html>
```

Convert this to a WordPress block theme called "Acme SaaS" in a folder named `theme/`. Use sensible defaults for anything I didn't specify. Write the files to disk.
