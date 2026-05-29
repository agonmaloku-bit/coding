/* eslint-disable no-console */
//
// Custom service-worker registration.
//
// We bypass the `register-service-worker` package's default registration so
// we can pass `updateViaCache: 'none'`. Without that option, browsers
// (especially iOS Safari, including the home-screen PWA) cache the
// `service-worker.js` script itself via HTTP, which means the browser may
// keep using a stale SW for hours/days even though a new build is live.
//
// We also actively poll for updates while the PWA is open and whenever it
// becomes visible again, so the in-app "A new version is available — Reload"
// toast appears reliably without forcing the user to fully kill the app.

if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const swUrl = `${process.env.BASE_URL}service-worker.js`;

    const dispatchUpdateAvailable = (registration) => {
        document.dispatchEvent(
            new CustomEvent("pwa-update-available", { detail: registration })
        );
    };

    const watchForUpdate = (registration) => {
        // If a waiting worker already exists at registration time, the update
        // toast must be shown immediately.
        if (registration.waiting && navigator.serviceWorker.controller) {
            console.log("[PWA] New SW already waiting on registration.");
            dispatchUpdateAvailable(registration);
        }

        registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;
            console.log("[PWA] New SW found, installing…");
            installing.addEventListener("statechange", () => {
                if (
                    installing.state === "installed" &&
                    navigator.serviceWorker.controller
                ) {
                    console.log(
                        "[PWA] New SW installed — update is available."
                    );
                    dispatchUpdateAvailable(registration);
                }
            });
        });
    };

    const triggerUpdate = (registration) => {
        if (!registration) return;
        // Force a network fetch of the SW script that bypasses HTTP cache.
        // `registration.update()` honors `updateViaCache`, but on some iOS
        // versions an explicit no-store fetch is more reliable.
        try {
            fetch(swUrl, { cache: "no-store" }).catch(() => {});
        } catch (e) {
            /* ignore */
        }
        try {
            registration.update().catch(() => {});
        } catch (e) {
            /* ignore */
        }
    };

    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register(swUrl, { updateViaCache: "none" })
            .then((registration) => {
                console.log("[PWA] Service worker registered.");
                watchForUpdate(registration);

                // Check immediately, then every 60s while the app is open.
                triggerUpdate(registration);
                setInterval(() => triggerUpdate(registration), 60 * 1000);

                // Re-check whenever the PWA window becomes visible again
                // (re-opening from the iOS / Android home screen).
                document.addEventListener("visibilitychange", () => {
                    if (document.visibilityState === "visible") {
                        triggerUpdate(registration);
                    }
                });
                window.addEventListener("focus", () => triggerUpdate(registration));
                window.addEventListener("pageshow", () => triggerUpdate(registration));
            })
            .catch((error) => {
                console.error(
                    "[PWA] Error during service worker registration:",
                    error
                );
            });

        // Reload as soon as a new SW takes control (skipWaiting + clientsClaim
        // are enabled in the workbox config), so the toast's Reload button is
        // mostly a manual trigger — the page often refreshes on its own.
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (refreshing) return;
            refreshing = true;
            // Don't auto-reload here; the user gets a toast they can tap.
            // window.location.reload();
        });
    });
}
