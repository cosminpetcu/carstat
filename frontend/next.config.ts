import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'frankfurt.apollo.olxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ireland.apollo.olxcdn.com',
      }
    ]
  },
};

export default withNextIntl(nextConfig);