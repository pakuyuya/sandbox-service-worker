const addResourcesToCache = async (resources) => {
    const cache = await caches.open('v1');
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    const cache = await caches.open('v1');
    await cache.put(request, response);
}

const cacheFirst = async({ request, preloadResponsePromise, fallbackUrl }) => {

    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info('using preload response', preloadResponse);
        putInCache(request, preloadReponse.clone());
        return preloadResponse;
    }

    try {
        const responseFromNetwork = await fetch(request.clone());

        putInChache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await chaches.match(fallbackUrl);
        if (fallbackResponse) {
            return fallbackResponse;
        }

        return new Response('Network error happened', {
            status: 408,
            header: { 'Content-Type': 'text/plain' },
        });
    }
}

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener('active', (event) => {
    console.log('bow!');
    event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
    console.log('wow!');
    event.waitUntil(
        addResourcesToCache([
            './',
            './index.html',
            './index.css',
            './success.png'
        ])
    );
});

self.addEventListener('fetch', (event) => {
    console.log(event);
    console.log('wooo!');
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
            fallbackUrl: './failed.png'
        })
    )
});

