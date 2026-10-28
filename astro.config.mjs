import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const DEFAULT_SITE_URL = 'https://phannguyendangtruong.github.io';

/** Origin of the deployed site from SITE_URL; a sub-path belongs in BASE_PATH. */
function siteUrl(value) {
  const raw = (value ?? '').trim();
  if (!raw) {
    console.warn(
      `Cảnh báo: chưa đặt SITE_URL, dùng mặc định ${DEFAULT_SITE_URL}. Nếu triển khai ở địa chỉ khác, hãy đặt SITE_URL.`,
    );
    return DEFAULT_SITE_URL;
  }
  let url;
  try {
    url = new URL(raw);
  } catch (_) {
    url = undefined;
  }
  const valid =
    url !== undefined &&
    (url.protocol === 'https:' || url.protocol === 'http:') &&
    url.hostname !== '' &&
    url.pathname === '/' &&
    url.search === '' &&
    url.hash === '';
  if (!valid) {
    throw new Error(`SITE_URL không hợp lệ: ${raw}. Cần dạng https://ten-mien, đường dẫn con đặt ở BASE_PATH.`);
  }
  return url.origin;
}

/** BASE_PATH as "/" or "/<segments>", whatever slashes were given. */
function basePath(value) {
  const parts = (value ?? '').split('/').filter(Boolean);
  return `/${parts.join('/')}`;
}

// Set SITE_URL (and BASE_PATH for a GitHub Pages project site) when deploying.
export default defineConfig({
  site: siteUrl(process.env.SITE_URL),
  base: basePath(process.env.BASE_PATH),
  trailingSlash: 'always',
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', vi: 'vi' } },
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
    }),
  ],
});
