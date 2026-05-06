import { useEffect, useMemo, useState } from 'react';
import { categoriesApi, servicesApi } from '../../api';
import { useNotify } from '../../context/NotifyContext';

function isAllCategory(value) {
    return value === null || value === 'all' || value === '';
}

export default function useServicesCatalog({
    enableSearch = false,
    enableOnlyActive = false,
    initialCategory = null,
    initialOnlyActive = true,
} = {}) {
    const notify = useNotify();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [query, setQuery] = useState('');
    const [onlyActive, setOnlyActive] = useState(enableOnlyActive ? initialOnlyActive : false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            try {
                const [servicesRes, categoriesRes] = await Promise.all([
                    servicesApi.getAll(),
                    categoriesApi.getAll(),
                ]);

                if (cancelled) return;
                setServices(servicesRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                if (!cancelled) {
                    notify.fromError(err, 'Не удалось загрузить каталог услуг');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [notify]);

    const normalizedQuery = query.trim().toLowerCase();

    const filteredServices = useMemo(() => services
        .filter((service) => {
            if (isAllCategory(selectedCategory)) return true;
            return String(service.category_id) === String(selectedCategory);
        })
        .filter((service) => (enableOnlyActive && onlyActive ? service.status === 'active' : true))
        .filter((service) => {
            if (!enableSearch || !normalizedQuery) return true;
            const haystack = `${service.name || ''} ${service.description || ''} ${service.category?.name || ''}`.toLowerCase();
            return haystack.includes(normalizedQuery);
        }), [services, selectedCategory, enableOnlyActive, onlyActive, enableSearch, normalizedQuery]);

    const selectedCategoryHeading = useMemo(() => {
        if (isAllCategory(selectedCategory)) return null;
        return categories.find((category) => String(category.id) === String(selectedCategory))?.name ?? null;
    }, [categories, selectedCategory]);

    return {
        services,
        categories,
        filteredServices,
        selectedCategory,
        setSelectedCategory,
        query,
        setQuery,
        onlyActive,
        setOnlyActive,
        isLoading,
        servicesShown: filteredServices.length,
        servicesTotal: services.length,
        selectedCategoryHeading,
    };
}
