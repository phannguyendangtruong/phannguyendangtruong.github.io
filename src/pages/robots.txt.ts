import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const sitemap = new URL('sitemap-index.xml', new URL(base, import.meta.env.SITE));
  const body = ['User-agent: *', 'Allow: /', `Sitemap: ${sitemap.href}`].join('\n');
  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
