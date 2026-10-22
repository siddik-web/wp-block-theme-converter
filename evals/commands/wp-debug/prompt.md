---
description: '/wp-debug finds the cause of a block validation error.'
tags: [command, debug, smoke]
max_turns: 15
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
---

/wp-debug

In the Site Editor my hero pattern shows "This block contains unexpected or invalid content." The pattern has:

```html
<!-- wp:paragraph -->
<p class="has-large-font-size">Hello</p>
<!-- /wp:paragraph -->
```

What's wrong and how do I fix it?
