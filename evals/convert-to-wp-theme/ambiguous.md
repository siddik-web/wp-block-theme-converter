# ambiguous — /convert-to-wp-theme

These queries are ambiguous: the skill is likely relevant, but there is not enough information to proceed without a clarifying question. For each case, paste the query into Claude with the skill installed and verify that Claude asks a clarifying question rather than making assumptions and proceeding.

---

## Query 1

Make this into WordPress.

**Expected behavior:** Claude should recognize that this is likely a WordPress theme conversion request but lacks critical information. It should ask what the user wants to convert — specifically requesting the HTML/CSS/JS source, clarifying whether they want a full theme conversion or something else (plugin, page, block), and confirming the WordPress version target.

**Minimum acceptable clarifying question:** Something like "Could you share the HTML/CSS/JS you'd like to convert? Also, are you looking to build a full block theme (FSE) or something else, like a page template or plugin?"

**Should NOT do:** Assume there is no source and scaffold an empty theme from scratch. Should not proceed to generate any theme files without source material or explicit confirmation that the user wants an empty scaffold.

**Why ambiguous:** "Make this into WordPress" implies there is source content to convert ("this"), but no content was provided. The word "WordPress" alone could mean a theme, a plugin, a page, or a block.

---

## Query 2

Convert my site.

**Expected behavior:** Claude should ask for the source files or URL, the type of WordPress output desired (block theme, classic theme, plugin), and basic theme identity (name, slug, target WP version). It must not proceed without this information.

**Minimum acceptable clarifying question:** "Happy to help convert your site to WordPress! Could you share the HTML/CSS/JS files (or paste the code), and let me know what type of WordPress project you're targeting — a full block theme is most likely, but just want to confirm."

**Should NOT do:** Fabricate a placeholder HTML structure and convert it. Should not ask only one question when multiple critical pieces of information are missing.

**Why ambiguous:** No source provided, no indication of desired WordPress output type, no theme identity. "My site" could refer to anything.

---

## Query 3

WordPress theme.

**Expected behavior:** This two-word input contains no verb and no source. Claude should ask what the user wants to do — build a new theme from scratch, convert existing HTML/CSS/JS, modify an existing theme, or something else. It should not infer a specific intent.

**Minimum acceptable clarifying question:** Something like "Are you looking to convert an existing HTML/CSS/JS project into a WordPress block theme, scaffold a new theme from scratch, or something else? A bit more context will help me point you in the right direction."

**Should NOT do:** Pick an interpretation and start scaffolding. Should not output any code or file structure without knowing the user's intent.

**Why ambiguous:** No verb (convert? create? fix?), no source, no context. The phrase "WordPress theme" is a topic, not a request.
