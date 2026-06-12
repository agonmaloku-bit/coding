import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

const appEnv = (env, name, fallback = '') => env[name] ?? env[`VITE_${name.replace(/^VUE_APP_/, 'APP_')}`] ?? fallback;
const appBoolEnv = (env, name, fallback = false) => {
    const value = appEnv(env, name, String(fallback));
    return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const base = env.BASE_URL || '/';

    return {
        base,
        plugins: [
            vue(),
            VitePWA({
                strategies: 'generateSW',
                filename: 'service-worker.js',
                injectRegister: false,
                manifest: {
                    name: 'PSM - Platforma e Sistemit të Menaxhimit',
                    short_name: 'PSM',
                    description: 'Platforma e Sistemit të Menaxhimit.',
                    start_url: '/',
                    scope: '/',
                    display: 'standalone',
                    background_color: '#ffffff',
                    theme_color: '#1d4ed8',
                    orientation: 'any',
                    icons: []
                },
                workbox: {
                    skipWaiting: true,
                    clientsClaim: true,
                    navigateFallback: '/index.html',
                    navigateFallbackDenylist: [/^\/admin/, /^\/api/],
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
                    globIgnores: ['**/*.map', 'manifest*.js'],
                    runtimeCaching: [
                        {
                            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'static-assets',
                                expiration: {
                                    maxEntries: 200,
                                    maxAgeSeconds: 60 * 60 * 24 * 30
                                }
                            }
                        }
                    ]
                }
            })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
            extensions: ['.mjs', '.js', '.vue', '.json']
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
            'process.env.BASE_URL': JSON.stringify(base),
            'process.env.VUE_APP_URL': JSON.stringify(appEnv(env, 'VUE_APP_URL')),
            'process.env.VUE_APP_TITLE': JSON.stringify(appEnv(env, 'VUE_APP_TITLE', 'PSM')),
            'process.env.VUE_APP_DESCRIPTION': JSON.stringify(appEnv(env, 'VUE_APP_DESCRIPTION', 'Platforma e Sistemit të Menaxhimit.')),
            'process.env.VUE_APP_DEV_TOOLS': JSON.stringify(appBoolEnv(env, 'VUE_APP_DEV_TOOLS', mode !== 'production'))
        },
        server: {
            host: '0.0.0.0'
        },
        preview: {
            host: '0.0.0.0'
        }
    };
});
