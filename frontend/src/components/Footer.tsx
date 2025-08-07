"use client";

import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import LanguageSelector from './LanguageSelector';
import IntlProvider from './IntlProvider';

function FooterContent() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">{t('company')}</h2>
            <p className="text-gray-300 mb-6 max-w-xs">
              {t('description')}
            </p>

            {/* Language Selector */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">{t('language')}</p>
              <LanguageSelector />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {tNav('home')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/listings`}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {t('browseListings')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/detailed-search`}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {t('advancedSearch')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/favorites`}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {tNav('favorites')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-gray-300 hover:text-white transition duration-200"
                >
                  {tNav('dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Extra space for future sections */}
          <div className="hidden lg:block">
            {/* Spațiu pentru viitoare secțiuni */}
          </div>

          <div className="hidden lg:block">
            {/* Spațiu pentru viitoare secțiuni */}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} {t('company')}. {t('copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <IntlProvider>
      <FooterContent />
    </IntlProvider>
  );
}