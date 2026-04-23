const DEFAULT = '/images/services/map-tour.png';

function pickByName(name) {
    const t = (name || '').toLowerCase();

    if (t.includes('спа') || t.includes('spa')) return '/images/services/spa.png';
    if (t.includes('ужин') || t.includes('дегустац')) return '/images/services/gourmet.png';
    if (t.includes('речной') || t.includes('круиз')) return '/images/services/cruise.png';
    if (t.includes('семейн') || t.includes('для семьи')) return '/images/services/family.png';
    if (t.includes('фотопрогул')) return '/images/services/family.png';
    if (t.includes('трансфер') || t.includes('аэропорт') || t.includes('вечернему центру')) {
        return '/images/services/city-night.png';
    }
    if (t.includes('горн')) return '/images/services/lake.png';
    if (t.includes('винодельн')) return '/images/services/vineyard.png';
    if (t.includes('озёрн') || t.includes('озер') || t.includes('панорам') || t.includes('побережь')) {
        return '/images/services/lake.png';
    }
    if (t.includes('историческ')) return '/images/services/heritage.png';
    if (t.includes('пешеходн') || t.includes('старому городу')) return '/images/services/heritage.png';
    if (t.includes('авторск')) return '/images/services/map-tour.png';
    if (t.includes('уикенд') || t.includes('для двоих')) return '/images/services/vineyard.png';

    return DEFAULT;
}

export function getServicePhotoUrl(service) {
    const raw = service?.image;
    if (raw != null && String(raw).trim() !== '') {
        const s = String(raw).trim();
        if (s.startsWith('http://') || s.startsWith('https://')) return s;
        return s.startsWith('/') ? s : `/${s}`;
    }
    return pickByName(service?.name);
}

export function serviceImageOnError(e) {
    const el = e.currentTarget;
    if (el.dataset.triedPublic === '1') return;
    el.dataset.triedPublic = '1';
    const src = el.getAttribute('src') || '';
    if (src.startsWith('/images/')) {
        el.src = `/public${src}`;
    }
}
