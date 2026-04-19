import { defineConfig } from 'vite';
import { resolve } from 'path';
import { writeFileSync, existsSync, unlinkSync } from 'fs';

/**
 * Sentinel file approach for WordPress + Vite integration.
 *
 * Creates `.vite-dev-running` when dev server starts, removes on stop.
 * WordPress checks for this file and switches between dev (HMR) and build mode.
 */
const sentinelFile = resolve(__dirname, '.vite-dev-running');

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        writeFileSync(sentinelFile, JSON.stringify({ port: 5173, started: Date.now() }));

        process.on('SIGINT', () => {
            if (existsSync(sentinelFile)) unlinkSync(sentinelFile);
            process.exit();
        });
        process.on('SIGTERM', () => {
            if (existsSync(sentinelFile)) unlinkSync(sentinelFile);
            process.exit();
        });
    }

    return {
        root: 'src',
        base: command === 'serve' ? '/' : '/wp-content/themes/{{THEME_SLUG}}/assets/',
        build: {
            outDir: resolve(__dirname, 'assets'),
            emptyOutDir: false,
            manifest: true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'src/js/main.js'),
                    interactions: resolve(__dirname, 'src/js/interactions.js'),
                    editor: resolve(__dirname, 'src/js/editor.js'),
                    style: resolve(__dirname, 'src/css/style.css'),
                    'editor-style': resolve(__dirname, 'src/css/editor.css'),
                },
                output: {
                    entryFileNames: 'js/[name].js',
                    chunkFileNames: 'js/[name].js',
                    assetFileNames: ({ name }) => {
                        if (/\.css$/.test(name ?? '')) return 'css/[name][extname]';
                        if (/\.(woff2?|ttf|otf|eot)$/.test(name ?? '')) return 'fonts/[name][extname]';
                        if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name ?? '')) return 'images/[name][extname]';
                        return '[name][extname]';
                    },
                },
            },
        },
        server: {
            port: 5173,
            strictPort: true,
            cors: true,
            host: '0.0.0.0',
            hmr: { host: 'localhost' },
        },
    };
});
