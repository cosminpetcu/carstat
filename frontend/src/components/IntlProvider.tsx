"use client";

import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

import enMessages from '@/messages/en.json';
import roMessages from '@/messages/ro.json';

interface IntlProviderProps {
    children: ReactNode;
}

export default function IntlProvider({ children }: IntlProviderProps) {
    const pathname = usePathname();
    const locale = pathname.startsWith('/ro') ? 'ro' : 'en';
    const messages = locale === 'ro' ? roMessages : enMessages;

    return (
        <NextIntlClientProvider
            messages={messages}
            locale={locale}
            timeZone="Europe/Bucharest"
        >
            {children}
        </NextIntlClientProvider>
    );
}