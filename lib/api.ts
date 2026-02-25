let csrfToken: string | null = null;

export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
    const isMutative = options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase());

    if (isMutative) {
        if (!csrfToken) {
            try {
                const res = await fetch('/api/csrf');
                const data = await res.json();
                csrfToken = data.csrfToken;
            } catch (e) {
                console.error('Failed to fetch CSRF token:', e);
            }
        }
    }

    const headers = new Headers(options.headers);
    if (isMutative && csrfToken) {
        headers.set('x-csrf-token', csrfToken);
    }

    return fetch(url, { ...options, headers });
}
