export const AVATAR_GRADIENTS = [
    'linear-gradient(145deg, #5c6b5e, #2e3530)',
    'linear-gradient(145deg, #6b6356, #3a342c)',
    'linear-gradient(145deg, #4a5a62, #2a3238)',
    'linear-gradient(145deg, #5a6f6a, #2c3834)',
    'linear-gradient(145deg, #6d5c52, #3d332e)',
    'linear-gradient(145deg, #556056, #2a302b)',
    'linear-gradient(145deg, #5c6670, #30363c)',
    'linear-gradient(145deg, #4f5c58, #28302d)',
];

export function isDisplayableAvatarUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim();
    if (u.startsWith('data:image/')) return true;
    return /^https?:\/\//i.test(u);
}

export function clampAvatarStyle(n) {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    return Math.max(0, Math.min(AVATAR_GRADIENTS.length - 1, Math.floor(x)));
}
