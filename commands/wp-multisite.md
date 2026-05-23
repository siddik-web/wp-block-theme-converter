# /wp-multisite

Audit a theme for WordPress Multisite compatibility and generate any missing multisite-aware code, style variations, or WP-CLI migration scripts.

---

## When to Use

- The user needs their block theme to work on a WordPress Multisite (Network) installation
- The user is migrating content across multiple sites in a network
- The user wants per-site style variations for different brands on the same network
- The user is troubleshooting theme behaviour that differs between sites in a network

---

## Inputs

Gather the following (ask only if not provided):

| Input | Required | Default |
|-------|----------|---------|
| Network type | No | Subdirectory |
| Number of sites in network | No | Unknown (treat as unbounded) |
| Per-site brand differences (colors, fonts) | No | None — single shared theme.json |
| Plugins active per-site (e.g. WooCommerce on some sites) | No | None assumed |
| CPTs that should exist only on specific sites | No | None — register on all sites |
| Whether theme is already active (adding multisite to existing theme) | Yes | — |

---

## Workflow

### Step 1: Audit

If the user provides an existing theme, audit it for these common multisite incompatibilities:

| Check | Problem if fails | Fix |
|-------|-----------------|-----|
| Hardcoded `http://example.com` URLs | Breaks sub-sites | Replace with `home_url()` or `get_template_directory_uri()` |
| Hardcoded blog IDs (`blog_id = 1`) | Targets wrong site | Remove or use `get_current_blog_id()` |
| `get_stylesheet_directory()` for non-child-theme use | May return wrong path | Replace with `get_template_directory()` |
| `register_post_type()` without `init` hook | May not fire per-site | Ensure it's on `init` |
| `switch_to_blog()` in front-end templates | Performance & caching issues | Remove; use per-site queries instead |
| Pattern slugs without theme-slug prefix | Collision risk | Add `{{theme-slug}}/` prefix |

State findings explicitly before generating any code.

### Step 2: Plan

State what will be generated:

- PHP changes for multisite compatibility (if any)
- New style variations for per-site branding (if requested)
- `wp_initialize_site` seeding hook (if site data needs pre-population)
- WP-CLI migration scripts for activating/migrating the theme across the network
- CI matrix addition for multisite testing

Show the plan and confirm before generating files unless the user said "just do it."

### Step 3: Generate

#### Multisite compatibility changes to functions.php / inc/

Apply only the fixes identified in Step 1. Follow Principle 3 — touch only what the audit found.

Example: adding `is_multisite()` gate to a CPT that should only exist on site 1:

```php
function {{theme_slug_underscored}}_register_post_types(): void {
    if ( is_multisite() && 1 !== get_current_blog_id() ) {
        return;
    }
    register_post_type( '{{cpt-slug}}', array( /* existing args */ ) );
}
```

#### Style variations (if per-site branding requested)

Generate one `styles/{{brand-slug}}.json` per site brand. See `references/multisite.md` → Style Variations for Network Sites.

Minimal variation: override only the color palette and font family. Do not duplicate full theme.json.

#### wp_initialize_site hook (if new-site seeding needed)

Generate `inc/multisite.php` with the seeding hook. Include only what was explicitly requested.

#### WP-CLI scripts

Generate a `bin/network-setup.sh` script with:
- `wp theme enable {{theme-slug}} --network`
- Loop activating the theme on all sites
- Loop flushing rewrites and caches on all sites

```bash
#!/usr/bin/env bash
# bin/network-setup.sh
# Activate {{theme-slug}} on all sites in a WordPress Multisite network.
# Usage: bash bin/network-setup.sh
# Requires: WP-CLI 2.8+ in PATH, run from WordPress root.

set -euo pipefail

THEME="{{theme-slug}}"

echo "Network-enabling theme..."
wp theme enable "$THEME" --network

echo "Activating theme on all sites..."
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
    echo "  → $url"
    wp theme activate "$THEME" --url="$url"
    wp rewrite flush --hard --url="$url"
    wp cache flush --url="$url"
done

echo "Done."
```

#### CI matrix (if user has a GitHub Actions workflow)

Add the multisite matrix variant to the existing `wordpress-tests` job. See `references/multisite.md` → CI Testing on Multisite for the full YAML.

### Step 4: Verify

Provide:
- Manual testing steps for multisite (activate on sub-site, open Site Editor, check patterns)
- WP-CLI verification script for confirming the theme is active on all sites
- Reference to `references/multisite.md` → Multisite Checklist

---

## Success Criteria

```
SUCCESS CRITERIA:
1. Theme activates on main site with zero PHP errors/warnings
2. Theme activates on every sub-site with zero PHP errors/warnings
3. Site Editor opens on main site and all sub-sites without errors
4. All block patterns appear in inserter on all active sites
5. Global Styles overrides on one site do not affect other sites
6. CI matrix includes multisite: true variant and passes
7. No hardcoded URLs or blog IDs remain in theme PHP files
```

---

## Reference

Read `references/multisite.md` before starting. Cross-reference:

- `references/content-migration.md` → for migrating content per-site
- `references/ci-cd.md` → for adding multisite to the CI pipeline
- `references/validation-checklist.md` → Multisite section
