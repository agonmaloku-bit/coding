const path = require("path");
const vueSrc = "./src";
module.exports = {
    runtimeCompiler: true,
    transpileDependencies: ['vue-router', 'vue-meta'],
    // css: {
    //     modules: true
    // },
    configureWebpack: {
        resolve: {
            alias: {
                "@": path.resolve(__dirname, vueSrc)
            },
            extensions: ['.js', '.vue', '.json']
        }
    },
    pwa: {
        name: 'CoOPS',
        themeColor: '#1d4ed8',
        msTileColor: '#1d4ed8',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        manifestOptions: {
            name: 'CoOPS — Operations Platform',
            short_name: 'CoOPS',
            description: 'Contracts, bills and operations management.',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#1d4ed8',
            orientation: 'any',
            icons: [
                { src: '/img/icons/android-chrome-72x72.png',  sizes: '72x72',   type: 'image/png' },
                { src: '/img/icons/android-chrome-96x96.png',  sizes: '96x96',   type: 'image/png' },
                { src: '/img/icons/android-chrome-128x128.png',sizes: '128x128', type: 'image/png' },
                { src: '/img/icons/android-chrome-144x144.png',sizes: '144x144', type: 'image/png' },
                { src: '/img/icons/android-chrome-152x152.png',sizes: '152x152', type: 'image/png' },
                { src: '/img/icons/android-chrome-192x192.png',sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
                { src: '/img/icons/android-chrome-384x384.png',sizes: '384x384', type: 'image/png' },
                { src: '/img/icons/android-chrome-512x512.png',sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
            ]
        },
        iconPaths: {
            favicon32:        'img/icons/favicon-32x32.png',
            favicon16:        'img/icons/favicon-16x16.png',
            appleTouchIcon:   'img/icons/apple-touch-icon.png',
            maskIcon:         'img/icons/apple-touch-icon.png',
            msTileImage:      'img/icons/msapplication-icon-144x144.png'
        },
        workboxPluginMode: 'GenerateSW',
        workboxOptions: {
            // Take control immediately on the first load and on each update.
            skipWaiting: true,
            clientsClaim: true,
            // SPA fallback so deep links work offline.
            navigateFallback: '/index.html',
            // Never serve API responses from cache — they are user/permission scoped.
            navigateFallbackBlacklist: [/^\/admin/, /^\/api/],
            exclude: [/\.map$/, /^manifest.*\.js?$/],
            runtimeCaching: [
                {
                    // Cache static assets (images/fonts) with a long-lived cache.
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
    }
};
