import DOMPurify from 'isomorphic-dompurify';

export const sanitize = (value: string | undefined | null) => {
    if (!value) return value;
    return DOMPurify.sanitize(value);
};
