import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ro'] as const;
export type Locale = typeof locales[number];

function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale);
}

export default getRequestConfig(async ({ locale }) => {
    if (!locale || !isValidLocale(locale)) notFound();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
        timeZone: 'Europe/Bucharest',
        formats: {
            number: {
                currency: {
                    style: 'currency',
                    currency: 'EUR'
                }
            }
        }
    };
});
