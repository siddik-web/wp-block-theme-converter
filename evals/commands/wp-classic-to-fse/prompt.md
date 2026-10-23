---
description: '/wp-classic-to-fse converts a classic header.php into a block template part.'
tags: [command, classic]
max_turns: 15
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

/wp-classic-to-fse

Here's my classic theme's header.php. Convert just this file and save the result as `parts/header.html`.

```php
<header class="site-header">
  <a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php bloginfo( 'name' ); ?></a>
  <?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
</header>
```
