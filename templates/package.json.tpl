{
    "name": "{{THEME_SLUG}}",
    "version": "{{VERSION}}",
    "description": "{{THEME_DESCRIPTION}}",
    "author": "{{AUTHOR_NAME}}",
    "license": "GPL-2.0-or-later",
    "private": true,
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview",
        "lint:php": "phpcs --standard=phpcs.xml .",
        "lint:php:fix": "phpcbf --standard=phpcs.xml .",
        "lint:js": "eslint 'assets/js/**/*.js' 'src/js/**/*.js'",
        "lint:js:fix": "eslint --fix 'assets/js/**/*.js' 'src/js/**/*.js'",
        "lint:css": "stylelint 'assets/css/**/*.css' 'src/css/**/*.css'",
        "lint:css:fix": "stylelint --fix 'assets/css/**/*.css' 'src/css/**/*.css'",
        "lint": "npm run lint:php && npm run lint:js && npm run lint:css",
        "zip": "rm -rf dist && npm run build && mkdir -p dist && zip -r dist/{{THEME_SLUG}}.zip . -x 'node_modules/*' 'src/*' 'dist/*' '.git/*' '.github/*' 'vendor/*' '*.log' '.env*' 'package*.json' 'vite.config.js' 'postcss.config.js' '.eslintrc*' '.stylelintrc*' 'phpcs.xml' '.editorconfig' '.gitignore'"
    },
    "devDependencies": {
        "vite": "^6.0.0",
        "@wordpress/eslint-plugin": "^21.0.0",
        "@wordpress/stylelint-config": "^23.0.0",
        "eslint": "^9.0.0",
        "stylelint": "^16.0.0",
        "postcss": "^8.4.0",
        "postcss-nesting": "^13.0.0",
        "autoprefixer": "^10.4.0"
    },
    "dependencies": {}
}
