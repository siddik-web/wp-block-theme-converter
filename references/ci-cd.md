# CI/CD Reference

Continuous integration and deployment pipelines for WordPress block themes. Read this when the user asks about automated testing, GitHub Actions, or deployment pipelines for their theme.

---

## Table of Contents

1. [CI Pipeline Overview](#ci-pipeline-overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [PHPCS (PHP Code Standards)](#phpcs-php-code-standards)
4. [ESLint and Stylelint](#eslint-and-stylelint)
5. [Vite Build Verification](#vite-build-verification)
6. [WordPress Theme Check](#wordpress-theme-check)
7. [Automated Accessibility Tests](#automated-accessibility-tests)
8. [Deployment to Managed Hosts](#deployment-to-managed-hosts)
9. [Environment Variables and Secrets](#environment-variables-and-secrets)
10. [Pipeline Checklist](#pipeline-checklist)

---

## CI Pipeline Overview

### Recommended Pipeline Stages

```
Pull Request → CI checks (fast, < 5 min)
  ├── PHP lint (PHPCS)
  ├── JS lint (ESLint)
  ├── CSS lint (Stylelint)
  ├── theme.json validation (ajv-cli against WP schema)
  └── Build (Vite)

Merge to main → Full test (< 15 min)
  ├── All CI checks above
  ├── Theme Check
  ├── Accessibility scan (axe-core)
  └── Lighthouse (performance + a11y score)

Tag / Release → Deploy
  ├── Build production assets
  ├── Create theme zip
  └── Deploy to staging → production
```

### theme.json Validation

Validate `theme.json` against the WordPress schema on every PR to catch structural errors early. Add this job to your CI workflow:

```yaml
validate-theme-json:
  name: Validate theme.json
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Set up Node 20
      uses: actions/setup-node@v4
      with:
        node-version: '20'

    - name: Install ajv-cli
      run: npm install -g ajv-cli ajv-formats

    - name: Download theme.json schema
      run: curl -sSL https://schemas.wp.org/trunk/theme.json -o /tmp/theme-schema.json

    - name: Validate theme.json
      run: ajv validate -s /tmp/theme-schema.json -d theme.json --strict=false
```

For local development, add a Makefile target:

```makefile
validate-theme-json:
 @curl -sSL https://schemas.wp.org/trunk/theme.json -o /tmp/theme-schema.json
 @ajv validate -s /tmp/theme-schema.json -d theme.json --strict=false \
   && echo "theme.json valid" || exit 1
```

Or using WP-CLI on a local WordPress installation:

```bash
wp theme-json validate --theme={{theme-slug}}
```

---

### Files Required in Theme Root

```
{{theme-slug}}/
├── .github/
│   └── workflows/
│       ├── ci.yml          # PR checks
│       └── deploy.yml      # Release deployment
├── .phpcs.xml.dist         # PHPCS configuration
├── .eslintrc.json          # ESLint configuration
├── .stylelintrc.json       # Stylelint configuration
├── composer.json           # PHP dev dependencies (PHPCS)
├── package.json            # Node dev dependencies
└── vite.config.js          # Build configuration
```

---

## GitHub Actions Workflows

### CI Workflow (PR Checks)

`See template: templates/github-actions-ci.yml.tpl`

Full workflow contents:

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  php-lint:
    name: PHP Code Standards
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer:v2
          coverage: none

      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader

      - name: Run PHPCS
        run: composer run-script phpcs

  js-lint:
    name: JavaScript Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint:js

  css-lint:
    name: CSS Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Run Stylelint
        run: npm run lint:css

  build:
    name: Vite Build
    runs-on: ubuntu-latest
    needs: [js-lint, css-lint]
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Build assets
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: built-assets
          path: assets/dist/
          retention-days: 7
```

### Deploy Workflow (Release)

```yaml
name: Deploy

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment target'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

jobs:
  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production assets
        run: npm run build

      - name: Create theme zip
        run: |
          mkdir -p dist
          zip -r dist/${{ github.event.repository.name }}.zip . \
            --exclude "*.git*" \
            --exclude "node_modules/*" \
            --exclude "*.github*" \
            --exclude "dist/*" \
            --exclude "*.phpcs.xml*" \
            --exclude "*.eslintrc*" \
            --exclude "*.stylelintrc*" \
            --exclude "composer.*" \
            --exclude "package*.json" \
            --exclude "vite.config.*" \
            --exclude "*.spec.*" \
            --exclude "tests/*"

      - name: Upload theme zip
        uses: actions/upload-artifact@v4
        with:
          name: theme-zip
          path: dist/*.zip

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ${{ secrets.WP_THEMES_PATH }}
            rm -rf ${{ github.event.repository.name }}
            unzip -q /tmp/${{ github.event.repository.name }}.zip -d .
            wp cache flush --path=${{ secrets.WP_PATH }}
```

### Theme Zip Exclusion List

Files that must NOT be in a distributed theme zip:

```
.git/
.github/
node_modules/
dist/ (build output before it's moved to assets/)
*.map (source maps — optional, remove for distribution)
.phpcs.xml.dist
.eslintrc.json
.stylelintrc.json
composer.json
composer.lock
package.json
package-lock.json
vite.config.js
tests/
*.spec.js
*.test.js
*.test.php
```

---

## PHPCS (PHP Code Standards)

### Configuration File (`.phpcs.xml.dist`)

```xml
<?xml version="1.0"?>
<ruleset name="{{Theme Name}}">
    <description>PHP CodeSniffer ruleset for {{Theme Name}}.</description>

    <!-- Files to check -->
    <file>.</file>

    <!-- Exclude paths -->
    <exclude-pattern>*/vendor/*</exclude-pattern>
    <exclude-pattern>*/node_modules/*</exclude-pattern>
    <exclude-pattern>*/tests/*</exclude-pattern>

    <!-- WordPress Coding Standards -->
    <rule ref="WordPress-Extra">
        <!-- Allow short array syntax [] -->
        <exclude name="Generic.Arrays.DisallowShortArraySyntax"/>
    </rule>

    <!-- Require PHP 7.4+ syntax -->
    <rule ref="PHPCompatibilityWP"/>
    <config name="testVersion" value="7.4-"/>
    <config name="minimum_supported_wp_version" value="6.5"/>

    <!-- WordPress text domain -->
    <rule ref="WordPress.WP.I18n">
        <properties>
            <property name="text_domain" type="array">
                <element value="{{text-domain}}"/>
            </property>
        </properties>
    </rule>
</ruleset>
```

### composer.json for PHPCS

```json
{
    "name": "{{author}}/{{theme-slug}}",
    "description": "{{Theme Name}} WordPress block theme",
    "type": "wordpress-theme",
    "license": "GPL-2.0-or-later",
    "require-dev": {
        "squizlabs/php_codesniffer": "^3.9",
        "wp-coding-standards/wpcs": "^3.1",
        "phpcompatibility/phpcompatibility-wp": "*",
        "dealerdirect/phpcodesniffer-composer-installer": "^1.0"
    },
    "scripts": {
        "phpcs": "phpcs",
        "phpcbf": "phpcbf"
    },
    "config": {
        "allow-plugins": {
            "dealerdirect/phpcodesniffer-composer-installer": true
        }
    }
}
```

### Running Locally

```bash
# Install
composer install

# Check (no fixes)
composer run-script phpcs

# Auto-fix (safe fixes only)
composer run-script phpcbf

# Check a specific file
./vendor/bin/phpcs inc/enqueue.php

# Check and show source rule for each error
./vendor/bin/phpcs --report=source
```

### Common PHPCS Violations in Block Themes

| Violation | Fix |
|-----------|-----|
| `WordPress.Security.EscapeOutput.OutputNotEscaped` | Add `// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped` after `get_block_wrapper_attributes()` calls (this is safe because WordPress sanitizes it) |
| `WordPress.WP.I18n.MissingTranslatorsComment` | Add `/* translators: %s: variable description */` before `sprintf()` with translatable strings |
| `WordPress.Files.FileName.InvalidClassFileName` | Name the file `class-{{slug}}.php` matching the class name |
| `WordPress.NamingConventions.PrefixAllGlobals` | Prefix all functions, classes, and constants with theme slug |
| `Squiz.PHP.CommentedOutCode` | Remove commented-out code |

---

## ESLint and Stylelint

### `.eslintrc.json`

```json
{
    "extends": [
        "plugin:@wordpress/eslint-plugin/recommended",
        "plugin:@wordpress/eslint-plugin/i18n"
    ],
    "env": {
        "browser": true,
        "es2022": true
    },
    "parserOptions": {
        "ecmaVersion": 2022,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "error",
        "no-debugger": "error",
        "@wordpress/i18n-text-domain": ["error", { "allowedTextDomains": ["{{text-domain}}"] }]
    }
}
```

### `.stylelintrc.json`

```json
{
    "extends": [
        "@wordpress/stylelint-config",
        "stylelint-config-standard"
    ],
    "plugins": [
        "stylelint-a11y"
    ],
    "rules": {
        "a11y/no-outline-none": true,
        "a11y/selector-pseudo-class-focus": true,
        "a11y/media-prefers-reduced-motion": true,
        "color-no-invalid-hex": true,
        "unit-no-unknown": true,
        "property-no-unknown": true,
        "selector-id-pattern": null,
        "custom-property-pattern": null
    }
}
```

### `package.json` Scripts

```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint:js": "eslint assets/js blocks --ext .js",
        "lint:css": "stylelint assets/css/**/*.css",
        "lint": "npm run lint:js && npm run lint:css",
        "lint:fix": "eslint assets/js blocks --ext .js --fix && stylelint assets/css/**/*.css --fix"
    },
    "devDependencies": {
        "@wordpress/eslint-plugin": "^21.0.0",
        "@wordpress/stylelint-config": "^23.0.0",
        "eslint": "^8.57.0",
        "stylelint": "^16.0.0",
        "stylelint-a11y": "^1.2.3",
        "stylelint-config-standard": "^36.0.0",
        "vite": "^6.0.0"
    }
}
```

---

## Vite Build Verification

The CI build step catches:

- Import errors (missing modules, typos)
- Syntax errors in JS and CSS
- Asset path resolution failures

Vite exits with a non-zero code on build failure, causing the CI job to fail.

### `vite.config.js` for CI

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( {
    build: {
        outDir: 'assets/dist',
        emptyOutDir: true,
        manifest: true,
        rollupOptions: {
            input: {
                // Add all entry points here
                'main':         resolve( __dirname, 'assets/js/main.js' ),
                'interactions': resolve( __dirname, 'assets/js/interactions.js' ),
                'style':        resolve( __dirname, 'assets/css/style.css' ),
                'editor':       resolve( __dirname, 'assets/css/editor.css' ),
            },
            output: {
                // Stable filenames for development; hashed for production
                entryFileNames: 'js/[name]-[hash].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: 'css/[name]-[hash][extname]',
            },
        },
    },
    css: {
        postcss: {
            plugins: [
                // autoprefixer and nesting configured in postcss.config.js
            ],
        },
    },
} );
```

---

## WordPress Theme Check

WordPress Theme Check plugin validates themes for WordPress.org submission requirements. Run locally or in CI.

### CLI via WP-CLI + Docker

```yaml
# In GitHub Actions — theme-check job
theme-check:
    name: WordPress Theme Check
    runs-on: ubuntu-latest
    needs: build
    services:
        mysql:
            image: mysql:8.0
            env:
                MYSQL_ROOT_PASSWORD: root
                MYSQL_DATABASE: wordpress
            ports: ['3306:3306']
            options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=5

    steps:
        - uses: actions/checkout@v4

        - name: Download built assets
          uses: actions/download-artifact@v4
          with:
              name: built-assets
              path: assets/dist/

        - name: Set up WordPress
          uses: WordPress/setup-wordpress@v1
          with:
              version: '6.8'
              multisite: false

        - name: Install Theme Check plugin
          run: wp plugin install theme-check --activate

        - name: Run Theme Check
          run: |
              wp theme activate {{theme-slug}}
              wp eval 'run_themechecks_against_theme( wp_get_theme() );' 2>&1 | \
                grep -E '(REQUIRED|WARNING|INFO)' | \
                tee theme-check-results.txt

        - name: Fail if REQUIRED violations found
          run: |
              if grep -q 'REQUIRED' theme-check-results.txt; then
                  echo "Theme Check found REQUIRED violations:"
                  grep 'REQUIRED' theme-check-results.txt
                  exit 1
              fi
```

### Common Theme Check Violations

| Violation | Fix |
|-----------|-----|
| Missing `screenshot.png` | Add 1200×900px screenshot |
| No `readme.txt` | Add WordPress.org format `readme.txt` |
| Missing `Tested up to` in readme | Add current WordPress stable version |
| Missing `License` in style.css | Add `License: GPL-2.0-or-later` |
| `add_theme_support()` missing | Verify all required `after_setup_theme` declarations |
| Hardcoded `http://` | Use `https://` or protocol-relative `//` |
| Unescaped output | Wrap in `esc_html()`, `esc_attr()`, etc. |

---

## Automated Accessibility Tests

```yaml
# In GitHub Actions — a11y job
accessibility:
    name: Accessibility Scan
    runs-on: ubuntu-latest
    needs: deploy-staging

    steps:
        - uses: actions/checkout@v4

        - name: Set up Node
          uses: actions/setup-node@v4
          with:
              node-version: '20'
              cache: 'npm'

        - name: Install axe-cli
          run: npm install -g @axe-core/cli

        - name: Run axe scan
          run: |
              axe ${{ secrets.STAGING_URL }} \
                  ${{ secrets.STAGING_URL }}/blog/ \
                  ${{ secrets.STAGING_URL }}/contact/ \
                  --tags wcag2a,wcag2aa \
                  --reporter json > axe-results.json

        - name: Check for violations
          run: |
              violations=$(node -e "
                const r = require('./axe-results.json');
                const total = r.reduce((acc, p) => acc + p.violations.length, 0);
                console.log(total);
              ")
              if [ "$violations" -gt "0" ]; then
                  echo "axe found $violations accessibility violations"
                  cat axe-results.json | python3 -m json.tool
                  exit 1
              fi
```

---

## Deployment to Managed Hosts

### WP Engine

```yaml
- name: Deploy to WP Engine
  uses: wpengine/github-action-wpe-site-deploy@v3
  with:
      WPE_SSHG_KEY_PRIVATE: ${{ secrets.WPE_SSHG_KEY_PRIVATE }}
      WPE_ENV: ${{ vars.WPE_ENV_NAME }}
      LOCAL_PATH: ./
      REMOTE_PATH: wp-content/themes/{{theme-slug}}/
      CACHE_CLEAR: true
      FLAGS: -azvr --delete --exclude=".git" --exclude="node_modules"
```

### Kinsta via SSH

```yaml
- name: Deploy to Kinsta
  uses: appleboy/ssh-action@v1
  with:
      host: ${{ secrets.KINSTA_HOST }}
      username: ${{ secrets.KINSTA_USER }}
      key: ${{ secrets.KINSTA_SSH_KEY }}
      port: ${{ secrets.KINSTA_PORT }}
      script: |
          rsync -avz --delete \
              --exclude='.git' \
              --exclude='node_modules' \
              --exclude='*.phpcs.xml*' \
              --exclude='package*.json' \
              --exclude='composer.*' \
              --exclude='vite.config.*' \
              /home/runner/work/{{theme-slug}}/ \
              ${{ secrets.KINSTA_THEME_PATH }}/
          wp cache flush --path=${{ secrets.KINSTA_WP_PATH }}
```

### Cloudways via rsync

```yaml
- name: Deploy to Cloudways
  run: |
      mkdir -p ~/.ssh
      echo "${{ secrets.CLOUDWAYS_SSH_KEY }}" > ~/.ssh/deploy_key
      chmod 600 ~/.ssh/deploy_key
      rsync -avz --delete \
          -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no -p ${{ secrets.CLOUDWAYS_SSH_PORT }}" \
          --exclude='.git' \
          --exclude='node_modules' \
          ./ \
          ${{ secrets.CLOUDWAYS_USER }}@${{ secrets.CLOUDWAYS_HOST }}:${{ secrets.CLOUDWAYS_THEME_PATH }}/
```

---

## Environment Variables and Secrets

### Required Secrets (GitHub Settings → Secrets and Variables)

| Secret name | Description |
|-------------|-------------|
| `SSH_HOST` | Deployment server hostname |
| `SSH_USER` | SSH username |
| `SSH_PRIVATE_KEY` | SSH private key (ECDSA or RSA, no passphrase) |
| `WP_THEMES_PATH` | Absolute path to `wp-content/themes/` on server |
| `WP_PATH` | Absolute path to WordPress root (for `wp cache flush`) |
| `STAGING_URL` | Staging site URL for automated tests |

### Required Variables (non-secret)

| Variable name | Description |
|---------------|-------------|
| `WPE_ENV_NAME` | WP Engine environment name (if using WP Engine) |
| `NODE_ENV` | `production` for build jobs |

### Generating an SSH Key for CI

```bash
# Generate a key with no passphrase
ssh-keygen -t ed25519 -C "ci@my-theme" -f ci_deploy_key -N ""

# Add public key to server
cat ci_deploy_key.pub >> ~/.ssh/authorized_keys  # On the server

# Add private key to GitHub Secrets as SSH_PRIVATE_KEY
cat ci_deploy_key
```

---

## Pipeline Checklist

### Repository Setup

- [ ] `.phpcs.xml.dist` committed and points to `WordPress-Extra` + `PHPCompatibilityWP`
- [ ] `composer.json` with PHPCS + WPCS dev dependencies
- [ ] `.eslintrc.json` using `@wordpress/eslint-plugin/recommended`
- [ ] `.stylelintrc.json` using `@wordpress/stylelint-config`
- [ ] `package.json` with `lint:js`, `lint:css`, `build` scripts
- [ ] `vite.config.js` with all entry points defined

### GitHub Actions

- [ ] CI workflow triggers on PR and push to main
- [ ] PHP lint job (PHPCS) passes
- [ ] JS lint job (ESLint) passes
- [ ] CSS lint job (Stylelint) passes
- [ ] theme.json validation job (ajv-cli) passes
- [ ] Build job (Vite) passes and uploads artifacts
- [ ] Deploy workflow triggers on release tag
- [ ] Theme zip excludes development files

### Secrets

- [ ] SSH credentials configured in GitHub Secrets
- [ ] Staging URL configured for accessibility tests

### Quality Gates

- [ ] CI fails on any PHPCS error (not just warning)
- [ ] CI fails on any ESLint error
- [ ] CI fails on any Stylelint error
- [ ] CI fails on Vite build error
- [ ] Deploy blocked if CI fails (branch protection rules)
