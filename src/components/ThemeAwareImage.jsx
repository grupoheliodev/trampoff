import React, { useEffect, useState } from 'react';

const ThemeAwareImage = ({ darkSrc, lightSrc, alt = '', className = '' }) => {
    const getInitial = () => {
        if (typeof document === 'undefined') return 'dark';
        try {
            const attr = document.documentElement.getAttribute('data-theme');
            if (attr) return attr;
            const stored = localStorage.getItem('trampoff_theme');
            if (stored) return stored;
            if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                return 'light';
            }
            return 'dark';
        } catch (e) {
            return 'dark';
        }
    };

    const [theme, setTheme] = useState(getInitial);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
        const readTheme = () => {
            try {
                const attr = document.documentElement.getAttribute('data-theme');
                if (attr) return attr;
                const stored = localStorage.getItem('trampoff_theme');
                if (stored) return stored;
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
                return 'dark';
            } catch (e) {
                return 'dark';
            }
        };

        const update = () => setTheme(readTheme());

        update();

        let observer;
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(update);
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        }

        const onStorage = (ev) => {
            if (ev.key === 'trampoff_theme') update();
        };
        window.addEventListener('storage', onStorage);

        return () => {
            window.removeEventListener('storage', onStorage);
            if (observer) observer.disconnect();
        };
    }, []);

    const src = (theme === 'light' && lightSrc) ? lightSrc : (darkSrc || lightSrc || '');
    if (!src) return null;
    return <img src={src} alt={alt} className={className} />;
};

export default ThemeAwareImage;
