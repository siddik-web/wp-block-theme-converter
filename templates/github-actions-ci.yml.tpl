# GitHub Actions CI Workflow Template
# =====================================
# Copy to: .github/workflows/ci.yml in your theme
# Replace: {{theme-slug}}, {{text-domain}}, {{STAGING_URL_SECRET}}
#
# Required GitHub Secrets:
#   SSH_HOST          — deployment server hostname
#   SSH_USER          — SSH username
#   SSH_PRIVATE_KEY   — SSH private key (Ed25519 recommended; rotate annually)
#   WP_THEMES_PATH    — absolute path to wp-content/themes/ on server
#   WP_PATH           — absolute path to WordPress root
#   STAGING_URL       — staging site URL (for a11y tests)
#
# SSH Key Security Notes:
#   - Generate a dedicated deploy key (never reuse personal keys):
#       ssh-keygen -t ed25519 -C "github-actions-deploy" -f ci_deploy_key
#   - Use Ed25519 over RSA for stronger security
#   - Set a passphrase if your runner supports SSH_ASKPASS or ssh-agent
#   - Restrict the key on the server to a specific command if possible:
#       command="rsync --server ...",no-pty,no-agent-forwarding ssh-ed25519 AAAA...
#   - Rotate the key at least annually; revoke immediately if a secret is exposed

name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ─────────────────────────────────────────────────────────────────
  # PHP Code Standards
  # ─────────────────────────────────────────────────────────────────
  php-lint:
    name: PHP Code Standards (PHPCS)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up PHP 8.2
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer:v2
          coverage: none

      - name: Cache Composer packages
        uses: actions/cache@v4
        with:
          path: vendor
          key: composer-${{ hashFiles('composer.lock') }}
          restore-keys: composer-

      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader

      - name: Run PHPCS
        run: ./vendor/bin/phpcs

  # ─────────────────────────────────────────────────────────────────
  # JavaScript Lint
  # ─────────────────────────────────────────────────────────────────
  js-lint:
    name: JavaScript Lint (ESLint)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint:js

  # ─────────────────────────────────────────────────────────────────
  # CSS Lint
  # ─────────────────────────────────────────────────────────────────
  css-lint:
    name: CSS Lint (Stylelint)
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Run Stylelint
        run: npm run lint:css

  # ─────────────────────────────────────────────────────────────────
  # Vite Build
  # ─────────────────────────────────────────────────────────────────
  build:
    name: Vite Production Build
    runs-on: ubuntu-latest
    needs: [js-lint, css-lint]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Node dependencies
        run: npm ci

      - name: Build production assets
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: built-assets
          path: assets/dist/
          retention-days: 7

  # ─────────────────────────────────────────────────────────────────
  # All checks passed — summary job
  # ─────────────────────────────────────────────────────────────────
  ci-passed:
    name: All Checks Passed
    runs-on: ubuntu-latest
    needs: [php-lint, js-lint, css-lint, build]
    if: always()

    steps:
      - name: Verify all jobs passed
        run: |
          if [[ "${{ needs.php-lint.result }}" != "success" || \
                "${{ needs.js-lint.result }}" != "success" || \
                "${{ needs.css-lint.result }}" != "success" || \
                "${{ needs.build.result }}" != "success" ]]; then
            echo "One or more CI jobs failed"
            exit 1
          fi
          echo "All CI checks passed ✓"
