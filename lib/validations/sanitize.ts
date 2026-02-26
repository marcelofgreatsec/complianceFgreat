// Simple regex-based HTML tag stripper to avoid heavy JSDOM dependency on Vercel
export const sanitize = (value: string | undefined | null) => {
    if (!value || typeof value !== 'string') return value;
    // Strip HTML tags using regex
    return value.replace(/<[^>]*>?/gm, '');
};

