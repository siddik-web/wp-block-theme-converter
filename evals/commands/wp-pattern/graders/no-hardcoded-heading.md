---
type: regex
target: { source: file, path: patterns/hero.php }
pattern: '<h1[^>]*>\s*Ship faster'
match: not_contains
---
