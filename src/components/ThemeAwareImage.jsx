import React, { useEffect, useState } from 'react';

const ThemeAwareImage = ({ darkSrc, lightSrc, alt = '', className = '' }) => {
    const getInitial = () => {
        if (typeof document === 'undefined') return 'dark';
        try {
            return document.documentElement.getAttribute('data-theme') || localStorage.getItem('trampoff_theme') || 'dark';
        } catch (e) {
            return 'dark';
        }
    };

    const [theme, setTheme] = useState(getInitial);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;
        const update = () => {
            const next = document.documentElement.getAttribute('data-theme') || localStorage.getItem('trampoff_theme') || 'dark';
            setTheme(next);
        };

        update();

        let observer;
        if (typeof MutationObserver !== 'undefined') {
            observer = new MutationObserver(update);
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        }

        window.addEventListener('storage', update);

        return () => {
            window.removeEventListener('storage', update);
            if (observer) observer.disconnect();
        };
    }, []);

    const src = theme === 'light' && lightSrc ? lightSrc : darkSrc;
    return <img src={src} alt={alt} className={className} />;
};

export default ThemeAwareImage;
