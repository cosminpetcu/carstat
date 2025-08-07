"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const languageNames = {
    en: 'English',
    ro: 'Română'
} as const;

const languageFlags = {
    en: '🇺🇸',
    ro: '🇷🇴'
} as const;

export default function LanguageSelector() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const switchLanguage = (newLocale: string) => {
        const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
        const newPath = `/${newLocale}${pathWithoutLocale}`;

        router.push(newPath);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors duration-200 rounded-md hover:bg-gray-700/50"
                aria-label="Language"
            >
                <span className="text-base">{languageFlags[locale as keyof typeof languageFlags]}</span>
                <span className="hidden sm:inline">{languageNames[locale as keyof typeof languageNames]}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg min-w-[140px] z-50">
                    {Object.entries(languageNames).map(([loc, name]) => (
                        <button
                            key={loc}
                            onClick={() => switchLanguage(loc)}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors duration-200 first:rounded-t-md last:rounded-b-md ${locale === loc ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'
                                }`}
                        >
                            <span className="text-base">{languageFlags[loc as keyof typeof languageFlags]}</span>
                            <span>{name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}