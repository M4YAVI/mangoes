import type { MetadataRoute } from 'next';
import { getCatalog } from './lib/catalog';
import { SITE_URL, varietySlug } from './lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const catalog = await getCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                       lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/mangoes`,                lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/track`,                  lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${SITE_URL}/contact`,                lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${SITE_URL}/shipping-policy`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/refund-policy`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms-and-conditions`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const varietyRoutes: MetadataRoute.Sitemap = catalog.map((m) => ({
    url: `${SITE_URL}/mangoes/${varietySlug(m.name)}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: [`${SITE_URL}${m.image}`],
  }));

  return [...staticRoutes, ...varietyRoutes];
}
